# APLUX-Agora/CGI-Stereo

## Resumen

CGI-Stereo es un modelo de estimación de profundidad estéreo publicado por APLUX-Agora bajo el paraguas de Agora, una plataforma de despliegue de modelos en hardware Qualcomm orientado a AIoT. El modelo toma como entrada un par de imágenes izquierda y derecha ya rectificadas y produce un mapa de disparidad a nivel de píxel junto con una representación coloreada del mismo, lo que permite derivar profundidad mediante triangulación clásica. Es, por tanto, un componente de percepción visual pensado para integrarse en pipelines embebidos, no un modelo generativo de propósito general.

La relevancia del artefacto no reside en un avance arquitectónico publicado, sino en su empaquetado: los pesos se distribuyen como recursos ya convertidos y cuantizados para el SoC Qualcomm QCS6490, con un binario QNN en precisión W8A8 y una latencia medida en placa real de 136,8 ms sobre una Rhino Pi A1. El repositorio de Hugging Face no contiene la model card técnica del modelo original ni información sobre su entrenamiento, y su tamaño es de 0,0 GB, lo que sugiere que los artefactos pesados se sirven desde la infraestructura de Agora o mediante descarga selectiva por target.

La ficha se limita, por tanto, a lo verificable: tarea, entradas y salidas, target hardware, precisión y licencia. Cualquier dato sobre arquitectura interna, número de parámetros, dataset o resultados de benchmarks no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de disparidad estéreo; sin detalle de backbone en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, entradas de par de imágenes) |
| Tipos de cuantizacion | W8A8 (entero 8 bits para pesos y activaciones) en el target QCS6490 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | APLUX Model Farm License para los recursos convertidos; licencia del modelo original según los términos del modelo fuente (no disponible) |
| Formato de pesos | binarios QNN `model.bin` por precisión dentro de `targets/<SoC>/`; `model.json` con precisión por defecto y rutas de variantes |
| Tarea (pipeline) | depth-estimation |
| Entradas | `left` (imagen), `right` (imagen) |
| Salidas | `disparity` (imagen), `out` (JSON) |
| SoC soportado | Qualcomm QCS6490 (placa Rhino Pi A1 / 犀牛派 A1) |
| Latencia medida | 136,8 ms en QCS6490 con precisión por defecto (W8A8) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo: la model card no describe el backbone, el mecanismo de correlación de costes, el número de parámetros ni el esquema de agregación estéreo. Tampoco se indica si emplea una red tipo cost-volume con regularización 3D, una aproximación iterativa o un transformer de correspondencia. La única información estructural disponible es funcional: consume un par estéreo rectificado y emite disparidad densa más una salida JSON.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre volumen de tokens o imágenes, composición del dataset, técnicas de aumento, funciones de pérdida ni procesos de ajuste fino. Lo que sí está documentado es el proceso de conversión y despliegue: el modelo se distribuye como recursos compilados para el SDK QNN de Qualcomm, con cuantización W8A8 y una latencia medida en placa. El repositorio incluye `NOTICE.md` y `SHA256SUMS` para verificación de integridad, y el paquete se organiza por SoC y precisión, lo que facilita la reproducibilidad del despliegue aunque no la del entrenamiento.

## Capacidades

- Estimación de disparidad estéreo densa a partir de dos imágenes rectificadas, con salida de mapa de disparidad y visualización coloreada.
- Generación de una salida JSON estructurada (`out`) además de la imagen de disparidad, útil para integración en pipelines que consumen metadatos.
- Ejecución en hardware Qualcomm QCS6490 mediante QNN con cuantización W8A8.
- Despliegue reproducible por target: descarga selectiva por SoC y precisión mediante `hf download --include "targets/<SoC>/*"`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking; el modelo es exclusivamente de visión estéreo.
- No se documentan capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Robótica móvil embebida: el modelo proporciona un mapa de disparidad a 136,8 ms por par en un QCS6490, lo que permite alimentar bucles de evitación de obstáculos a una frecuencia del orden de 7 Hz, suficiente para navegación lenta en interiores con un consumo energético propio de AIoT.
- Drones y AGV con presupuesto térmico limitado: al ejecutarse en un SoC Qualcomm de bajo consumo con QNN W8A8, encaja en plataformas donde no cabe una GPU dedicada y se necesita percepción de profundidad estéreo continua.
- Detección de obstáculos en pasillos y almacenes: la salida de disparidad permite segmentar por umbral de proximidad sin necesidad de un modelo de detección adicional, simplificando la pila de percepción.
- Medición de distancias en inspección industrial: con un par estéreo calibrado y rectificado, la disparidad se convierte en profundidad métrica mediante la focal y la línea base, lo que sirve para verificar distancias en cadenas de montaje.
- Prototipado rápido en Agora: la plataforma permite probar el modelo online sin placa y exportar el proyecto completo con preprocesado, postprocesado y runner, lo que reduce el tiempo de integración en un producto AIoT.
- Visión 3D de bajo coste en electrodomésticos y equipos de consumo: sustituye a sensores de profundidad dedicados con dos cámaras y un SoC Qualcomm, reduciendo el coste de bill of materials.
- Generación de datasets de profundidad pseudo-etiquetados: la salida de disparidad puede usarse para preetiquetar pares estéreo capturados en campo y entrenar después modelos específicos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es la latencia de inferencia en placa:

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia de inferencia | 136,8 ms | QCS6490, Rhino Pi A1, precisión por defecto (W8A8) |

No se dispone de métricas de calidad de disparidad (EPE, D1, bad-x) ni comparaciones con otros métodos estéreo.

## Requisitos de hardware

- Target principal: Qualcomm QCS6490, placa Rhino Pi A1 (犀牛派 A1), con precisión W8A8 y latencia medida de 136,8 ms.
- No se documentan otros SoC en la información proporcionada; la estructura `targets/<SoC>/` sugiere que podrían añadirse targets adicionales, pero no se listan.
- VRAM estimada: no disponible. El modelo se ejecuta en el acelerador NPU/Hexagon del SoC Qualcomm, no en GPU convencional.
- GPU recomendadas: no aplica para el artefacto publicado; no se documenta ejecución en A100, H100 ni RTX 4090.
- Ejecución en GPU de consumo: no disponible; el paquete distribuido es un binario QNN, no un formato portable tipo GGUF u ONNX.
- Opciones de despliegue: SDK QNN de Qualcomm a través del runner de Agora; descarga de recursos con `hf download` filtrando por `targets/<SoC>/*`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Throughput estimado: aproximadamente 7,3 pares por segundo en QCS6490, derivado de la latencia medida de 136,8 ms; no se publica throughput agregado ni latencia de pre/postprocesado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de estimación de disparidad estéreo (por ejemplo, variantes de RAFT-Stereo, CREStereo o modelos ligeros para embebido), ni datos de parámetros, contexto o rendimiento de alternativas que permitan una tabla rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CGI-Stereo | no disponible | no aplica | APLUX Model Farm (recursos) / original no disponible | Hugging Face, targets QCS6490 |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta evaluación de sesgo ni comportamiento en dominios fuera de distribución.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de disparidad errónea en regiones sin textura, oclusiones, superficies repetitivas o reflejos, sin que se hayan publicado métricas que lo cuantifiquen.
- Requiere imágenes ya rectificadas y calibradas; un par no rectificado producirá disparidades incorrectas y, por tanto, profundidades inválidas.
- El artefacto distribuido está atado al SoC QCS6490 y a la precisión W8A8; no es portable a otras plataformas sin reconversión y no se garantiza paridad numérica con el modelo original en coma flotante.
- Licencia: los recursos convertidos se rigen por la APLUX Model Farm License, cuyo texto está en `LICENSE_MODEL_FARM.pdf`; la licencia del modelo fuente no está identificada en la información disponible, por lo que el uso comercial requiere revisar ambos documentos antes de desplegar.
- El repositorio tiene un tamaño de 0,0 GB y cero descargas, lo que indica un artefacto recién publicado y sin validación comunitaria; conviene verificar `SHA256SUMS` y `NOTICE.md` antes de integrarlo.
- No se documentan limitaciones de idioma porque el modelo no procesa texto, pero tampoco se documenta su robustez ante condiciones de iluminación adversas, lo que debe validarse en el dominio de despliegue.
- La fecha de creación del repositorio (2026-11-09) y la ausencia de métricas de calidad impiden avalar su idoneidad en producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/CGI-Stereo
- Prueba online en Agora: https://mega.aidlux.com/models/cgi-stereo
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/CGI-Stereo/blob/main/LICENSE_MODEL_FARM.pdf
- Documentos de procedencia e integridad (referenciados en la model card): `NOTICE.md` y `SHA256SUMS` en el repositorio
