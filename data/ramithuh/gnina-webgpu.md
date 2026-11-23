# ramithuh/gnina-webgpu

## Resumen

GNINA 1.3 WebGPU es una reimplementación en JavaScript y WGSL del motor de docking molecular GNINA 1.3, ejecutable íntegramente en el navegador mediante WebGPU. No se trata de un modelo de lenguaje, sino de un conjunto de tres redes convolucionales 3D (CNN) de puntuación proteína-ligando exportadas a safetensors, junto con el pipeline de preprocesado (tipado de átomos Smina de 28 canales, descomposición energética Vina y generación de rejillas gaussianas de densidad atómica de 48×48×48×28 a resolución de 0,5 Å). El autor es ramithuh y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

El paquete reproduce el ensemble por defecto de GNINA 1.3 (`dense_1.3`, `dense_1.3_PT_KD_3`, `crossdock_default2018_KD_4`) con un total de 1.765.065 parámetros y 178 tensores, lo que permite incluirlo en un único shard de menos de 8 MB en FP32. Su relevancia radica en que traslada una herramienta de referencia en cribado virtual basado en deep learning a un entorno sin dependencias, sin instalación y potencialmente offline mediante CacheStorage, lo que facilita la docencia, la validación rápida de poses y la integración en aplicaciones web de química computacional.

La implementación se apoya en el commit `97fa6bcc465d62b40d87ccc85d3c53e9921a7cc0` del repositorio upstream `gnina/gnina` y cita el artículo «GNINA 1.3: the next increment in molecular docking with deep learning» (McNutt, Li, Meli, Aggarwal, Koes, J. Cheminformatics, 2025).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D sobre rejillas de densidad atómica (48×48×48×28, 0,5 Å) con ensemble de 3 modelos |
| Parametros totales | 1.765.065 (178 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 |
| Idiomas soportados | no aplica |
| Licencia | dual Apache-2.0 / GPLv2 (según upstream) |
| Formato de pesos | safetensors (bundle `gnina-safetensors-v1`), shard único |

## Arquitectura y entrenamiento

El modelo replica el ensemble de puntuación por defecto de GNINA 1.3: tres redes convolucionales 3D que operan sobre una representación volumétrica de la interfaz proteína-ligando. El preprocesado incluye tipado de átomos Smina de 28 canales, descomposición de energía empírica Vina y rasterización gaussiana de densidades atómicas en una rejilla de 48×48×48 vóxeles con resolución de 0,5 Å por eje y 28 canales. La inferencia se implementa en WGSL puro para WebGPU, sin dependencias externas.

Los pesos se exportan desde el repositorio upstream fijado en el commit `97fa6bcc465d62b40d87ccc85d3c53e9921a7cc0` mediante `tools/export_gnina.py` y se validan contra oráculos deterministas generados con `tools/dump_oracle.py`. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF/DPO (no aplicable en este dominio). La innovación técnica destacable es la paridad numérica entre la implementación WebGPU y la referencia Python, con errores relativos máximos del orden de 1e-6 en FP32 y hasta 4,45e-5 en INT8 sobre complejos de prueba (`184L`, `10GS`).

## Capacidades

- Puntuación de poses proteína-ligando mediante `scorePose`, devolviendo `CNNscore`, `CNNaffinity` (en unidades pK), `CNN_VS` y descomposición Vina.
- Ensemble de tres modelos con salida individual por modelo (`dense_1.3`, `dense_1.3_PT_KD_3`, `crossdock_default2018_KD_4`).
- Puntuación por lotes de múltiples poses (`scorePoses`).
- Minimización de pose de cuerpo rígido (`minimizePose`).
- Ablación de contribuciones por átomo y por residuo (`maskContributions`) para interpretabilidad.
- Desglose de la energía Vina (`vinaBreakdown`).
- Ejecución en Web Worker (`webgpu/worker.js`) con caché offline vía CacheStorage (`networkAttempts: 0`).
- Reutilización de un `GPUDevice` compartido externo y limpieza correcta en `destroy()` (0 buffers filtrados).
- Fallback controlado en Safari Private Mode o con `caches` bloqueado.
- No incluye generación de texto, razonamiento lingüístico, código, matemáticas, visión genérica, tool calling ni capacidades multilingües.

## Casos de uso

- Cribado virtual interactivo en el navegador: un usuario puede cargar un receptor en PDB y un ligando en SDF y obtener `CNNscore`, `CNNaffinity` y `CNN_VS` sin instalar GNINA ni CUDA, gracias a la ejecución WebGPU nativa.
- Docencia y demostraciones de docking: el bundle de menos de 8 MB en FP32 permite servir la herramienta desde una página estática y mostrar en tiempo real cómo varía la puntuación entre poses nativas y señuelos (por ejemplo, `184L` nativo 0,900 frente a señuelo 0,075).
- Validación rápida de poses en pipelines de modelado: integración como etapa `score` en un adaptador tipo `denovo.run`, recibiendo `StructureArtifact` con receptor y ligando y devolviendo métricas estandarizadas.
- Análisis de interpretabilidad: `maskContributions` permite identificar residuos y átomos que más contribuyen a la puntuación, útil en estudios de interacción farmacóforo-residuo.
- Refinamiento de poses: `minimizePose` aplica minimización de cuerpo rígido sobre la pose de entrada antes de puntuar, adecuado para preprocesar resultados de docking de otras herramientas.
- Aplicaciones web offline o con conectividad intermitente: el soporte de CacheStorage con `networkAttempts: 0` permite desplegar el motor en entornos con red restringida, como laboratorios o aulas.
- Integración en visores moleculares web: al ejecutarse en un Web Worker y aceptar un `GPUDevice` compartido, puede convivir con otras aplicaciones WebGPU en la misma página sin bloquear el hilo principal.

## Benchmarks y rendimiento

Los datos disponibles son de paridad numérica y latencia, no de benchmarks estándar de docking (no se reportan métricas como RMSD de redocking, enrichment factor ni AUC sobre DUD-E). Se presentan los resultados de paridad publicados:

| Complejo y pose | CNNscore (FP32) | CNNaffinity (pK) | CNN_VS | relRMS rejilla GPU | relRMS salida FP32 / FP16 / INT8 |
|---|---:|---:|---:|---:|---|
| `184L` nativa | 0,900 | 4,82 | 4,34 | 1,72e-7 | 2,31e-6 / 1,03e-6 / 2,17e-6 |
| `184L` señuelo | 0,075 | 2,61 | 0,20 | 6,02e-7 | 2,51e-5 / 5,00e-6 / 2,13e-5 |
| `10GS` nativa | 0,967 | 5,98 | 5,79 | 1,94e-7 | 6,53e-7 / 9,17e-7 / 1,08e-6 |
| `10GS` señuelo | 0,022 | 4,18 | 0,09 | 1,35e-6 | 1,53e-5 / 1,77e-5 / 4,45e-5 |

| Métrica de latencia (NVIDIA GB10) | FP32 | FP16 | INT8 |
|---|---:|---:|---:|
| Ensemble de 3 modelos en caliente | 65,8–68,9 ms | 64,2–66,3 ms | 61,1–67,0 ms |
| Inicialización en frío (loopback) | ~975 ms | ~246 ms | ~250 ms |
| VRAM residente | 7,06 MB | 3,56 MB | 1,81 MB |
| VRAM pico | 72,15 MB | 68,64 MB | 66,90 MB |
| Tras `destroy()` | 0 B | 0 B | 0 B |

No se han publicado resultados de benchmarks de docking estándar (redocking, cribado virtual) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,06 MB residentes en FP32, 3,56 MB en FP16 y 1,81 MB en INT8; pico de 66,90–72,15 MB durante la inferencia.
- GPU recomendadas: cualquier GPU con soporte WebGPU; el autor verificó en NVIDIA GB10. No se especifican otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: el tamaño del bundle (menos de 8 MB en FP32) hace plausible su ejecución en cualquier GPU integrada o dedicada con WebGPU, aunque no se aportan pruebas en modelos concretos de consumo.
- Opciones de despliegue: navegador Chromium con WebGPU (`allowSoftwareFallback: false`, rechazando SwiftShader, llvmpipe y WARP); Web Worker dedicado; CacheStorage para uso offline; reutilización de un `GPUDevice` compartido.
- Latencia y throughput: ensemble de 3 modelos en caliente en 61,1–68,9 ms según precisión en GB10; inicialización en frío de 246–975 ms; no se reporta throughput agregado para lotes grandes.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Despliegue |
|---|---|---:|---|---|---|
| GNINA 1.3 WebGPU (este) | CNN 3D de scoring | 1.765.065 | no aplica | Apache-2.0 / GPLv2 | Navegador con WebGPU |
| GNINA 1.3 upstream | CNN 3D de scoring | no disponible en la información | no aplica | Apache-2.0 / GPLv2 | Binario C++/CUDA |
| Smina / Vina | Scoring empírico | no aplica | no aplica | GPLv2 (upstream) | Binario C++ |
| DiffDock | Generación de poses (difusión) | no disponible | no aplica | MIT (según repositorio público) | Python/PyTorch |

La comparación con DiffDock se incluye como referencia de categoría (docking basado en deep learning), pero no se dispone de métricas comparativas en la información proporcionada; los datos de licencia y parámetros de las alternativas no proceden de la model card y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite generación de texto, razonamiento, código, tool calling ni capacidades multilingües.
- El repositorio figura con 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el paquete es meramente documental; conviene verificar la disponibilidad de los bundles `gnina-safetensors-v1` antes de integrarlo.
- Solo se ha validado en hardware NVIDIA GB10 y en Chromium con WebGPU; no hay datos de paridad en otras GPU ni en Firefox o Safari.
- Los benchmarks publicados son de paridad numérica frente a la referencia Python y de latencia, no de calidad de docking (redocking, enrichment); no se puede inferir su rendimiento en cribado real a partir de ellos.
- La licencia dual Apache-2.0 / GPLv2 implica que el uso comercial debe revisarse con cuidado: la rama GPLv2 impone obligaciones de copyleft sobre obras derivadas.
- La precisión INT8 introduce errores relativos de hasta 4,45e-5 en la salida, superiores a FP32 y FP16; para aplicaciones sensibles a pequeños cambios de puntuación conviene usar FP32 o FP16.
- El modelo depende del soporte de WebGPU del navegador; en entornos sin WebGPU o con `allowSoftwareFallback: false`, la ejecución fallará aunque exista un fallback software disponible.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por no ser un modelo generativo; los riesgos son los propios del scoring molecular (falsos positivos/negativos en la predicción de afinidad).
- La inicialización en frío en FP32 ronda 975 ms, lo que puede penalizar aplicaciones con sesiones muy cortas.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/gnina-webgpu
- Repositorio upstream GNINA: https://github.com/gnina/gnina
- Commit fijado: `97fa6bcc465d62b40d87ccc85d3c53e9921a7cc0`
- Artículo citado: A. McNutt, Y. Li, R. Meli, R. Aggarwal, D. R. Koes, «GNINA 1.3: the next increment in molecular docking with deep learning», J. Cheminformatics, 2025 (no se proporciona URL directa en la información disponible).
- Demo: carpeta `demo/` del propio repositorio (no se proporciona URL directa).
- Documentación de WebGPU: no disponible en la información proporcionada.
