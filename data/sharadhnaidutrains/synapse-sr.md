# SharadhNaiduTrains/synapse-sr

## Resumen

SYNAPSE-SR es un modelo de superresolución de imágenes satelitales Sentinel-2 L2A que transforma escenas de 10 m de resolución en productos de 2 m en las bandas B04 (rojo), B03 (verde), B02 (azul) y B08 (infrarrojo cercano). Lo desarrolla SharadhNaidu y se distribuye como pesos abiertos bajo licencia CC0-1.0, junto con un paquete Python (`synapse-sr`) que gestiona la descarga, la verificación SHA-256 de los pesos y la inferencia sobre GeoTIFF georreferenciados.

La propuesta técnica no es un superresolutor genérico: el modelo se apoya en un modelo físico del sensor Sentinel-2 (con la función de dispersión de punto por banda) y formula la salida como `x_hat = x_base + P_N(delta)`, donde `x_base` es una inversión regularizada del sensor y `P_N` proyecta la predicción de la red únicamente sobre el subespacio que el instrumento no puede observar. El resultado es que la red no puede alterar lo que el satélite midió, lo que reduce la alucinación espectral y permite etiquetar cada píxel como medido o inferido.

Se publican dos variantes: Flash v1 (12 MB, 0,6 M de parámetros, ~1 s por escena de 1,28 km en CPU de portátil) y Pro v2 (58 MB, 14,4 M de parámetros, ~5 s en GPU). La relevancia actual está en que ofrece una alternativa ligera y con incertidumbre calibrada a los superresolutores Sentinel-2 existentes (SEN2SR, LDSR-S2, Satlas ESRGAN), con entrenamiento que incluye imagery india de Cartosat-2E y Cartosat-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pro: backbone de espacio de estados Mamba (6 x 8 bloques visuales de espacio de estados), stem de contexto espectral a 20 m, mezclador de frecuencias y cabeza PixelShuffle x5. Flash: red convolucional re-parametrizada (tres ramas en entrenamiento, una convolución 3x3 por capa en inferencia) sobre las diez bandas |
| Parametros totales | Flash: 0,6 M (en inferencia). Pro: 14,4 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (`Flash/synapse-flash-v1.safetensors`, `Pro/synapse-pro-v2.safetensors`, `Pro/synapse-pro-v1.safetensors`) |

## Arquitectura y entrenamiento

La formulación central es una descomposición física: `x_base` es una inversión regularizada del modelo exacto del sensor Sentinel-2 (con la PSF por banda), y `delta` es la predicción de la red. La proyección `P_N` restringe ese delta al subespacio no observable por el sensor, de modo que la media de reflectancia medida en cada píxel de 10 m se restaura exactamente con una corrección suave. Pro usa un backbone Mamba de espacio de estados con 6 x 8 bloques visuales, un stem de contexto espectral a 20 m, un mezclador de frecuencias y una cabeza PixelShuffle de factor x5 directo; su ajuste físico por defecto es "tight" (0,5 unidades de ruido). Flash es una CNN re-parametrizada que se entrena con tres ramas convolucionales y colapsa a una convolución 3x3 por capa en inferencia, destilada a partir de Pro (knowledge distillation).

Los datos de entrenamiento combinan tres fuentes: 951 pares reales de Sentinel-2 L2A con NAIP aéreo de 0,6 m en Estados Unidos; un corpus en streaming de 3.044 parches NAIP nativos a 1 m sobre 15 clases de cobertura del suelo, observados a través del modelo exacto del sensor Sentinel-2 y con estructuras compuestas (carreteras, edificios, bordes de campos y agua); y 1.001 teselas indias de Cartosat-2E y Cartosat-3 (datos de muestra del portal Bhoonidhi de NRSC), procedentes de tres escenas, más una escena Cartosat-3 separada de validación. No se documenta en la información disponible el uso de RLHF o DPO (no aplica a un modelo image-to-image).

## Capacidades

- Superresolución de Sentinel-2 L2A de 10 m a 2 m en las bandas B04, B03, B02 y B08.
- Consistencia física con la medición: la salida no puede modificar lo que el sensor observó, gracias a la proyección `P_N`.
- Etiquetado por píxel de soporte (medido frente a inferido) y de incertidumbre calibrada (error esperado por píxel vía `r.uncertainty()`).
- Salida en GeoTIFF georreferenciado, apto para pipelines GIS.
- Inferencia en CPU, portátil, Colab, Kaggle y ARM con Flash; en GPU con Pro.
- Descarga y verificación SHA-256 de pesos; modo offline mediante `Flash.from_pretrained(weights=...)`.
- Adquisición de escenas integrada por CLI (`synapse-sr --fetch lon,lat --dates ...`) con previsualización PNG.
- No soporta tool calling, agentes, razonamiento multi-turno ni capacidades de texto, visión general o audio: es un modelo image-to-image especializado.

## Casos de uso

- Monitorización urbana a escala de parcela: con salida a 2 m se pueden delimitar edificios, viario y cambios de uso del suelo en ciudades indias (el modelo incluye ejemplos de Bengaluru y RV University) sin depender de imagery comercial de pago.
- Seguimiento de cultivos y superficies agrícolas: los ejemplos de Ludhiana (Punjab) muestran bordes de campos y parcelas; la consistencia física evita inventar texturas agrarias que no estén respaldadas por la medición de 10 m.
- Evaluación de daños por desastres: el ejemplo de Wayanad (Kerala, zonas afectadas por deslizamientos) ilustra el uso para cartografiar laderas y cicatrices de deslizamiento con detalle sub-píxel y una etiqueta de incertidumbre por píxel que permite priorizar la verificación sobre el terreno.
- Planificación y seguimiento de infraestructura: la proyección sobre el subespacio no observable preserva las reflectancias medidas, lo que hace la salida defendible ante auditorías técnicas cuando se comparan series temporales de una misma zona.
- Relleno de detalle en productos derivados: usar la salida de 2 m como capa de detalle para índices de vegetación o clasificadores que operan a 10 m, manteniendo coherencia espectral con la escena original (error de reflectancia de 0,0011 en Pro).
- Despliegue en campo o en entornos con recursos limitados: Flash corre en ~1 s por escena de 1,28 km en CPU de portátil, lo que permite procesar lotes en estaciones de trabajo sin GPU o en dispositivos ARM.
- Investigación reproducible en superresolución de teledetección: los pesos v1 de Pro se conservan explícitamente para reproducibilidad, y el protocolo de evaluación es el oficial de opensr-test, lo que facilita comparaciones entre grupos.

## Benchmarks y rendimiento

Protocolo oficial opensr-test, media sobre NAIP, SPOT, España urbano, España cultivos y VENuS (178 escenas), con los valores por defecto de synapse-sr 0.4.1.

| Modelo | Improvement ↑ | Omission ↓ | Hallucination ↓ | Detail corr. ↑ | RMSE ↓ | Spectral error ↓ | Reflectance error ↓ |
|---|---|---|---|---|---|---|---|
| SYNAPSE Flash | 0,155 | 0,748 | 0,097 | **0,300** | **0,0234** | 0,401 | 0,0018 |
| SYNAPSE Pro | **0,199** | 0,631 | 0,171 | 0,289 | 0,0254 | **0,223** | **0,0011** |
| SEN2SR | 0,150 | 0,759 | 0,091 | 0,284 | 0,0235 | 0,665 | 0,0025 |
| SEN2SR-Lite | 0,152 | 0,749 | 0,099 | 0,290 | **0,0234** | 0,463 | 0,0019 |
| LDSR-S2 | 0,197 | 0,599 | 0,204 | 0,206 | 0,0240 | 1,015 | 0,0036 |
| Satlas ESRGAN | 0,129 | **0,181** | 0,690 | 0,089 | 0,0443 | 7,787 | 0,0242 |
| Bicubic | 0,102 | 0,830 | **0,068** | 0,279 | **0,0234** | 0,601 | 0,0028 |

Según la model card, SYNAPSE es mejor en cinco de las siete columnas: Pro en improvement, error espectral y error de reflectancia; Flash en correlación de detalle y RMSE (empatado). Cobertura de la incertidumbre calibrada en píxeles de desarrollo retenidos: Flash 82/91/95 % a niveles 80/90/95 %; Pro 82/91/96 %.

## Requisitos de hardware

- Flash: 12 MB de pesos y 0,6 M de parámetros; ~1 s por escena de 1,28 km en CPU de portátil. Cabe en cualquier CPU moderna, en Colab, Kaggle y dispositivos ARM.
- Pro: 58 MB y 14,4 M de parámetros; ~5 s por escena en GPU. No se especifica en la información disponible la VRAM mínima ni las GPU concretas recomendadas.
- Al ser modelos de imagen de tamaño reducido, es razonable esperar que quepan en GPU de consumo (RTX 4090 y gamas inferiores), pero no se han publicado cifras de VRAM ni de throughput en la información disponible.
- Despliegue previsto mediante el paquete `synapse-sr` (`pip install synapse-sr`), con API Python (`super_resolve`, `save`, `uncertainty`) y CLI (`--fetch`, `--dates`, `--preview`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- No se publican cifras de latencia por píxel ni de throughput en escenas de mayor tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de salida | Improvement ↑ | Hallucination ↓ | Error espectral ↓ | Licencia |
|---|---|---|---|---|---|---|
| SYNAPSE Flash | 0,6 M | 2 m (B04/B03/B02/B08) | 0,155 | 0,097 | 0,401 | CC0-1.0 |
| SYNAPSE Pro | 14,4 M | 2 m (B04/B03/B02/B08) | 0,199 | 0,171 | 0,223 | CC0-1.0 |
| SEN2SR | No disponible | No disponible | 0,150 | 0,091 | 0,665 | No disponible |
| SEN2SR-Lite | No disponible | No disponible | 0,152 | 0,099 | 0,463 | No disponible |
| LDSR-S2 | No disponible | No disponible | 0,197 | 0,204 | 1,015 | No disponible |
| Satlas ESRGAN | No disponible | No disponible | 0,129 | 0,690 | 7,787 | No disponible |

No se dispone en la información proporcionada de los parámetros, la longitud de contexto (no aplica) ni los términos de licencia de los modelos comparables; solo de sus métricas en el protocolo opensr-test.

## Limitaciones y advertencias

- El modelo solo produce las bandas B04, B03, B02 y B08; no genera el resto de bandas de Sentinel-2 L2A.
- La incertidumbre está calibrada sobre píxeles de desarrollo retenidos; puede degradarse en dominios no representados en el entrenamiento (el corpus incluye EE. UU. e India, con menor peso de otras regiones).
- Pro presenta mayor hallucination (0,171) que Flash (0,097) y que SEN2SR (0,091); para aplicaciones donde la fidelidad espectral sea prioritaria conviene valorar Flash o revisar la incertidumbre por píxel.
- La proyección física impide alterar la medición, pero el detalle inferido sigue siendo una predicción: las etiquetas de soporte medido/inferido deben comunicarse en cualquier producto derivado.
- No hay información sobre sesgos geográficos o demográficos más allá de la composición del corpus de entrenamiento.
- Licencia CC0-1.0: permite uso comercial sin restricciones atribucionales, pero los componentes de terceros y sus licencias se listan en `THIRD_PARTY_NOTICES` del paquete y deben revisarse.
- Los datos Sentinel-2 son del programa Copernicus (ESA) y los de Cartosat de ISRO/NRSC (Bhoonidhi); su uso puede estar sujeto a sus propios términos, independientemente de la licencia del modelo.
- El repositorio tiene 0 descargas y 3 likes en el momento de la consulta: es un proyecto reciente con poca validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/SharadhNaiduTrains/synapse-sr
- Repositorio GitHub: https://github.com/SharadhNaidu/synapse-sr
- Documentación: https://sharadhnaidu.github.io/synapse-sr/
- Paquete PyPI: `pip install synapse-sr`
- Portal Bhoonidhi (datos Cartosat, ISRO/NRSC): no disponible en la información proporcionada
- Programa Copernicus (datos Sentinel-2, ESA): no disponible en la información proporcionada
