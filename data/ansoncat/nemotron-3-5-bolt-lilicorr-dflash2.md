# ansoncat/Nemotron-3.5-Bolt-LiLiCorr-DFlash2

## Resumen

Este repositorio contiene un checkpoint de decodificacion especulativa (draft model) para Nemotron 3.5 Bolt, un modelo de lenguaje de NVIDIA con arquitectura MoE de 74B parametros totales y 9B activos, empaquetado en un contenedor de 24 GB. El modelo aqui publicado no es el modelo principal, sino el draft LiLiCorr que NVIDIA distribuye para acelerar la inferencia mediante speculative decoding. La conversion, realizada por el usuario ansoncat, transforma el fichero GGUF original (998 MB) al formato BF16 que carga el motor Splash, evitando tener que convertir el GGUF en tiempo de instalacion.

El artefacto resultante ocupa 2,3 GB e incluye 1.144.286.122 parametros en safetensors, junto con un `config.json` en formato DFlash2 generado a partir de la cabecera del GGUF. Se trata de una conversion no oficial, sin revision ni respaldo de NVIDIA, pensada para la propuesta de soporte de Nemotron 3.5 Bolt en el repositorio incoai/splash. Su relevancia es acotada: sirve a quienes despliegan el modelo Bolt con Splash y prefieren un draft preconvertido y reproducible (con hashes SHA-256 publicados) frente a una conversion local.

La licencia del modelo base y de esta conversion es OpenMDW 1.1. No se proporcionan datos sobre idiomas soportados, pipeline ni resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model para decodificacion especulativa, formato DFlash2 (derivado del draft LiLiCorr de NVIDIA para Nemotron 3.5 Bolt, MoE 74B-A9B) |
| Parametros totales | 1.144.286.122 (draft); modelo objetivo: 74B totales, 9B activos |
| Parametros activos | 9B en el modelo objetivo (dato del nombre del modelo base); no disponible para el draft |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en BF16; el GGUF de origen contenia tensores NVFP4, Q8_0, BF16 y F32, dequantizados a BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (BF16); origen en GGUF |

## Arquitectura y entrenamiento

El modelo publicado es un draft de decodificacion especulativa, no un modelo generativo autonomo. La arquitectura subyacente corresponde al draft LiLiCorr que NVIDIA publica para Nemotron 3.5 Bolt, un modelo MoE de 74B parametros totales y 9B activos con contenedor de 24 GB. El draft se utiliza para proponer tokens que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado. El formato de destino es DFlash2, el layout BF16 que carga el motor Splash.

No hubo entrenamiento ni ajuste adicional: la conversion dequantiza los tensores NVFP4, Q8_0, BF16 y F32 del GGUF original, los escala y los redondea a BF16. El autor afirma que `model.safetensors` es byte a byte identico al que genera el instalador de la rama `ansoncat/splash@nemotron-3.5-bolt` (commit `f7211fe2`) a partir del GGUF fuente. Se publican hashes SHA-256 del GGUF de origen, del safetensors resultante y del fichero conversor, lo que permite verificar la reproducibilidad. No se dispone de informacion sobre el dataset de entrenamiento del draft original ni sobre el proceso de alineacion del modelo objetivo.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa sobre Nemotron 3.5 Bolt (74B-A9B) en el motor Splash.
- Carga directa en formato DFlash2 sin conversion en tiempo de instalacion.
- Verificacion de integridad mediante hashes SHA-256 publicados para el GGUF fuente y el safetensors resultante.
- No es un modelo de generacion autonoma: no produce respuestas por si mismo, solo propuestas de tokens para el modelo objetivo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues en la informacion disponible.

## Casos de uso

- Despliegue de Nemotron 3.5 Bolt con Splash: el draft permite activar speculative decoding sin ejecutar el conversor GGUF en cada instalacion, reduciendo el tiempo de puesta en marcha.
- Entornos con instalacion reproducible: los hashes SHA-256 del GGUF y del safetensors permiten auditar que el artefacto cargado coincide exactamente con la conversion esperada.
- Servicios de inferencia con requisitos de latencia: al proponer varios tokens por paso y verificarlos en paralelo contra el modelo de 74B-A9B, se reduce el coste por token en cargas interactivas.
- Pipelines de CI/CD para modelos: la conversion preempaquetada simplifica el artefacto que se descarga y valida en cada build, al eliminar la dependencia del conversor en el momento del despliegue.
- Investigacion sobre decodificacion especulativa: sirve como referencia para comparar el draft LiLiCorr en BF16 frente a otras estrategias de draft (EAGLE, Medusa, n-gram) sobre el mismo modelo objetivo.
- Pruebas de la integracion propuesta en incoai/splash#633: el checkpoint permite validar el soporte de Nemotron 3.5 Bolt en Splash antes de que la funcionalidad se consolide en la rama principal.
- Experimentacion en hardware con 24 GB de VRAM: el modelo objetivo esta disenado para ese contenedor, y el draft anade 2,3 GB, por lo que encaja en configuraciones de una sola GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El draft ocupa 2,3 GB en BF16; se suma al modelo objetivo Nemotron 3.5 Bolt, disenado para un contenedor de 24 GB.
- GPU recomendadas para el conjunto: una GPU con al menos 24 GB de VRAM para el modelo objetivo, mas margen para el draft y el contexto (por ejemplo, RTX 4090, L40S, A100 40 GB, H100).
- Cabe en GPU de consumo con 24 GB o mas solo si el modelo objetivo se ajusta al presupuesto de VRAM previsto por NVIDIA; no hay datos de latencia ni throughput.
- Opciones de despliegue: motor Splash (unico soportado por el formato DFlash2 segun la informacion disponible); el GGUF original es compatible con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ansoncat/Nemotron-3.5-Bolt-LiLiCorr-DFlash2 | Draft speculative decoding (DFlash2) | 1,14B (draft) | no disponible | OpenMDW 1.1 | HuggingFace, 25 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF | Draft speculative decoding (GGUF) | 998 MB en fichero | no disponible | OpenMDW 1.1 | HuggingFace (oficial de NVIDIA) |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB (modelo objetivo) | MoE generativo | 74B totales / 9B activos | no disponible | no disponible | Referenciado como base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no esta hecha, revisada ni respaldada por NVIDIA; el autor lo declara explicitamente.
- No es un modelo generativo: no puede usarse de forma autonoma para texto, codigo, matematicas ni ninguna otra tarea; solo acelera al modelo objetivo.
- Dependencia de un unico motor: el formato DFlash2 esta pensado para Splash, y la integracion con Nemotron 3.5 Bolt es una propuesta abierta (incoai/splash#633), no una funcionalidad consolidada.
- Sin datos de evaluacion: no hay benchmarks, metricas de aceptacion de tokens ni comparativas de velocidad publicadas.
- Idiomas y contexto sin documentar: no se puede garantizar cobertura linguistica ni longitud de contexto del draft.
- Riesgo de divergencia con el original: aunque el autor publica hashes, cualquier cambio futuro en el GGUF fuente o en el conversor invalidaria la equivalencia byte a byte.
- Licencia OpenMDW 1.1: conviene revisar sus terminos antes de uso comercial, ya que la model card solo enlaza al texto de la licencia sin resumir obligaciones.
- Baja adopcion: 25 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ansoncat/Nemotron-3.5-Bolt-LiLiCorr-DFlash2
- Modelo base (GGUF oficial de NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
- Repositorio del motor Splash: https://github.com/incoai/splash
- Propuesta de soporte de Nemotron 3.5 Bolt en Splash: https://github.com/incoai/splash/issues/633
- Rama del conversor usada: https://github.com/ansoncat/splash/tree/nemotron-3.5-bolt
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
