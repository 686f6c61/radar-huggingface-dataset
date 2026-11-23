# BudgetAny/Budget3D-Idol

## Resumen

Budget3D-Idol es un ajuste fino (fine-tune) de speridlabs/idol, un generador de Gaussian splats en 3D a partir de una sola imagen. Lo desarrolla BudgetAny, un proyecto comunitario de reimplementación y extensión de la idea de tokenización adaptativa al cómputo descrita en el paper BudgetPix (Kara et al., 2026). El modelo mantiene un único conjunto de pesos y permite elegir en inferencia cuántos de los 8.192 tokens latentes de Idol procesa el transformer de difusión: las regiones donde el latente varía menos (el espacio vacío primero) se fusionan en tokens más gruesos, de modo que el muestreo se vuelve más rápido y ligero.

El modelo resuelve el problema del coste computacional fijo en la generación image-to-3D: en lugar de reentrenar o disponer de checkpoints separados por presupuesto, el mismo checkpoint sirve para cualquier fracción de tokens entre el 6,25 % y el 100 %. Los codificadores de imagen y los decodificadores gaussianos de Idol se reutilizan sin cambios; solo se ajusta el denoiser (el DiT de Idol más los módulos Budget3D), con 378 M de parámetros en pesos fp32 EMA.

Es relevante ahora porque demuestra que la tokenización adaptativa al cómputo, propuesta originalmente para difusión de imágenes en espacio de píxeles, se puede trasladar a la generación 3D con ahorros medibles: hasta 4,38× de aceleración en muestreo con precisión completa al 10 % de los tokens, y 2,14× en bf16 al 40 %. Es un proyecto no oficial, sin respaldo de empresa o laboratorio, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT de Idol) con modulos Budget3D de tokenizacion adaptativa; decodificacion a Gaussian splats |
| Parametros totales | 378 M (denoiser ajustado; el repo pesa 1,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; 8.192 tokens latentes densos, reducibles en inferencia del 6,25 % al 100 % |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32 EMA; inferencia optimizada en bf16) |
| Idiomas soportados | No disponible (modelo image-to-3D, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`budget3d_idol.safetensors`) |

## Arquitectura y entrenamiento

Budget3D-Idol parte de speridlabs/idol, un generador de Gaussian splats a partir de una sola imagen que usa un transformer de difusión sobre 8.192 tokens latentes, con codificadores de imagen y decodificadores gaussianos propios. El ajuste fino incorpora los módulos Budget3D, que en inferencia fusionan los tokens latentes de las regiones de baja variación (empezando por el espacio vacío) en tokens más gruesos, reduciendo el número efectivo de tokens que procesa el DiT. Los pesos publicados son el denoiser ajustado (DiT de Idol más módulos Budget3D) en fp32 con media móvil exponencial (EMA); los codificadores y decodificadores de Idol se descargan aparte desde el repositorio original.

El muestreo emplea 50 pasos de Euler con classifier-free guidance de escala 3. El modelo base de 50 pasos tiene una variante de 5 pasos, Budget3D-Idol-Turbo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el autor remite a un tech report aún no publicado. La innovación técnica destacable es precisamente el presupuesto de tokens ajustable en inferencia con un único checkpoint, más un modo `--fast` de inferencia optimizada (bloques del transformer en bf16, TF32 en el resto, atención fusionada de cuDNN y `torch.compile` en bloques y adaptadores).

## Capacidades

- Generación image-to-3D: convierte una sola imagen en una representación de Gaussian splats renderizable desde cualquier órbita de cámara.
- Presupuesto de tokens ajustable en inferencia: el parámetro `--budget` acepta fracciones de 0,0625 a 1 sobre los 8.192 tokens densos, con el mismo conjunto de pesos.
- Inferencia optimizada opcional mediante `--fast`, con bloques en bf16, TF32, atención fusionada y compilación.
- Salida en formato `.ply` de Gaussian splats, compatible con el pipeline de renderizado de Idol.
- Variante de 5 pasos (Budget3D-Idol-Turbo) para muestreo rápido.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo generativo 3D sin componente de lenguaje.

## Casos de uso

- Prototipado rápido de assets 3D: con `--budget 0.4` o inferior se obtiene una malla gaussiana en segundos (2,66 s por objeto en bf16 frente a 5,67 s al 100 %), adecuada para iterar sobre bocetos antes de generar la versión final a presupuesto completo.
- Generación por lotes en servidores con GPU limitada: al 40 % de tokens el pico de memoria de muestreo baja a 7,8 GB en bf16, lo que permite procesar lotes mayores o usar GPUs de menor VRAM sin cambiar de checkpoint.
- Previsualización interactiva en WebUI: la WebUI comunitaria permite ajustar el presupuesto desde la interfaz, de modo que el usuario ve el objeto con calidad reducida mientras ajusta la cámara y regenera a mayor presupuesto cuando le conviene.
- Catalogos de e-commerce y realidad aumentada: generar representaciones 3D de productos desde una foto de catálogo con un coste de muestreo controlado por el operador según la criticidad del artículo.
- Investigación sobre tokenización adaptativa: el repositorio incluye los informes completos de velocidad y memoria en `perf/`, lo que facilita reproducir y comparar curvas de coste frente a calidad en distintos presupuestos.
- Integración en pipelines de contenido 3D: la salida `.ply` de Gaussian splats se puede renderizar con la órbita de 72 frames que el autor mide en 3,60 s por objeto, encajando en flujos automatizados de generación de vídeo turntable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, LPIPS, Chamfer, etc.) en la información disponible. El autor sí publica mediciones de velocidad y memoria en una NVIDIA H100 80GB HBM3, con 50 pasos de Euler, guidance 3 y lotes de 8 objetos, en modo `--fast` (bf16):

| Presupuesto | Tokens | Muestreo por objeto | Aceleracion | Memoria pico de muestreo | Extremo a extremo por objeto |
|---:|---:|---:|---:|---:|---:|
| 100 % | 8.192 | 5,67 s | 1,00× | 9,9 GB | 11,80 s |
| 80 % | 6.554 | 4,59 s | 1,24× | 9,2 GB | 10,34 s |
| 60 % | 4.915 | 3,60 s | 1,58× | 8,5 GB | 9,33 s |
| 50 % | 4.096 | 3,18 s | 1,79× | 8,2 GB | 8,96 s |
| 40 % | 3.277 | 2,66 s | 2,14× | 7,8 GB | 8,62 s |

En precisión completa (fp32) el autor llega hasta el 10 % de tokens: 14,48 s por objeto y 4,38× de aceleración, con 8,7 GB de pico de memoria. El pico de memoria incluye unos 4,5 GB de pesos residentes y codificadores de imagen; el decodificado de gaussianos (2,53 s) y el renderizado de 72 frames (3,60 s) no dependen del presupuesto.

## Requisitos de hardware

- VRAM estimada: unos 4,5 GB de pesos residentes más codificadores de imagen; el pico de muestreo va de 9,9 GB (100 % de tokens, bf16) a 7,8 GB (40 %); en fp32, de 14,8 GB (100 %) a 8,7 GB (10 %).
- GPU recomendadas: NVIDIA H100 80GB HBM3 es la plataforma de las mediciones publicadas; por memoria, cualquier GPU con al menos 10 GB (bf16) o 15 GB (fp32) debería poder ejecutar el muestreo completo.
- Cabe en GPU de consumo: sí, con al menos 10 GB de VRAM en bf16 (por ejemplo, RTX 3080 de 10 GB en adelante, RTX 4070 Ti o superiores); en fp32 harían falta unos 15 GB.
- Opciones de despliegue: repositorio oficial Budget3D (`scripts/sample.py`), demo en Hugging Face Spaces y WebUI comunitaria. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5,67 s por objeto al 100 % y 2,66 s al 40 % en H100 con bf16 y lotes de 8; extremo a extremo, 11,80 s y 8,62 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens latentes | Presupuesto ajustable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Budget3D-Idol | 378 M (denoiser) | 8.192, reducibles al 6,25 % | Si, en inferencia | Apache 2.0 | Hugging Face, codigo, demo, WebUI |
| speridlabs/idol (base) | No disponible | 8.192 fijos | No | No disponible en la informacion | Hugging Face |
| Budget3D-Idol-Turbo | No disponible | 8.192, reducibles | Si, en inferencia | No disponible en la informacion | Hugging Face |

No se dispone de datos de otros generadores image-to-3D comparables en la información proporcionada.

## Limitaciones y advertencias

- Proyecto no oficial: es una reimplementación comunitaria de la idea de BudgetPix, no una release del paper ni de un laboratorio; los números de la model card son mediciones propias del proyecto.
- El paper original cubre solo difusión de imágenes en espacio de píxeles; la aplicación a image-to-3D es una extensión de este proyecto y no está validada por los autores del paper.
- No hay benchmarks de calidad 3D publicados: se desconoce la degradación de fidelidad geométrica y de color al reducir el presupuesto de tokens, especialmente por debajo del 40 %.
- El tech report está pendiente de publicación, y no se detallan dataset de entrenamiento, número de tokens ni método de alineación.
- El modelo no procesa lenguaje: no tiene capacidades multilingües, de tool calling ni de agentes.
- Los pesos se publican en fp32 EMA; no se ofrecen cuantizaciones GGUF ni otras variantes cuantizadas.
- Requiere descargar por separado los codificadores de imagen y decodificadores gaussianos de speridlabs/idol, lo que añade dependencia de ese repositorio.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Idol antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/Budget3D-Idol
- Modelo base: https://huggingface.co/speridlabs/idol
- Variante Turbo: https://huggingface.co/BudgetAny/Budget3D-Idol-Turbo
- Pagina del proyecto: https://budgetany.github.io/budget3d/
- Codigo: https://github.com/BudgetAny/Budget3D
- Demo en Spaces: https://huggingface.co/spaces/hugging-apps/budget3d-idol
- WebUI comunitaria: https://github.com/RetroUpgrade-YouTube/budget3d-webui
- Paper BudgetPix: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny: https://huggingface.co/BudgetAny
