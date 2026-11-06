# kaitchup/LFM3-1.7B-GSQ-GGUF

## Resumen

LFM3-1.7B-GSQ-GGUF es una familia de tres checkpoints GGUF del modelo LiquidAI/LFM3-1.7B, generados por el autor independiente kaitchup mediante tecnicas de cuantizacion de precision mixta: SLQ + GSQ y RCO + GSQ. El objetivo no es tanto reducir el modelo a un unico formato estandar (Q4_K_M, Q8_0, etc.) como aplicar formatos de tensor distintos por capa para preservar la calidad del modelo original con un coste de almacenamiento contenido. El modelo base LFM3-1.7B pertenece a la familia LFM3 de Liquid AI y cuenta con 1.728.801.600 parametros.

La relevancia de esta publicacion es doble. Por un lado, ofrece alternativas listas para usar en llama.cpp con soporte de LFM3, con tamanos de fichero de aproximadamente 1,59 GB (variantes Q6_K) y 1,00 GB (variante IQ4_XS). Por otro, documenta una evaluacion held-out basada en EAR (Expected Acceptance Rate) frente a la referencia BF16 en cuatro idiomas (ingles, frances, japones e hindi), lo que permite comparar la fidelidad de cada checkpoint de forma reproducible dentro de cada idioma.

Es importante subrayar que este repositorio no contiene el modelo original ni una model card tecnica completa del mismo: la informacion disponible se limita a los datos de cuantizacion, los tamanos de fichero, la metrica EAR y las instrucciones de ejecucion con llama.cpp. Cualquier dato sobre arquitectura interna, contexto nativo, composicion del dataset de entrenamiento o benchmarks estandar (MMLU, HumanEval, GSM8K) del modelo base no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM3 de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecucion usa `--ctx-size 8192` |
| Tipos de cuantizacion | GGUF con precision mixta: Q6_K_RCO, Q6_K_SLQ, IQ4_XS_RCO (etiquetas de familia; los formatos reales por tensor varian) |
| Idiomas soportados | no disponibles oficialmente; la evaluacion cubre ingles, frances, japones e hindi |
| Licencia | lfm1.0 (LFM Open License v1.0; campo `license: other` con `license_name: lfm1.0`) |
| Formato de pesos | GGUF (tres ficheros: 1,587627 GB, 1,587722 GB y 0,999985 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3-1.7B en la documentacion proporcionada: no se especifica si es un transformer denso, un modelo con atencion lineal, un hibrido o cualquier otra variante. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo unico verificable es el recuento de parametros (1.728.801.600) y la pertenencia a la familia LFM3 de Liquid AI.

La innovacion tecnica documentada en este repositorio es la cuantizacion. Se aplican dos pipelines: SLQ + GSQ y RCO + GSQ. GSQ (referencia arXiv:2604.18556) actua como capa de cuantizacion de precision mixta, mientras que SLQ (arXiv:2605.02404) y RCO (arXiv:2605.00649) son metodos complementarios que el autor combina con GSQ. El resultado son asignaciones de formato por capa que no coinciden exactamente con la etiqueta del fichero: el sufijo del nombre (Q6_K o IQ4_XS) identifica la familia principal, pero los mapas de calor incluidos en el repositorio muestran los formatos reales de cada tensor. La evaluacion se realiza con EAR (Expected Acceptance Rate) frente a la referencia BF16, sobre 64 secuencias de 2.048 tokens por idioma, usando FineWeb-Edu para ingles y FineWeb2 para frances, japones e hindi.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `text-generation` y `conversational`, y es compatible con endpoints.
- Ejecucion en llama.cpp: los tres checkpoints estan pensados para builds de llama.cpp con soporte de LFM3, con despliegue via `llama-server`.
- Preservacion de calidad medida: la variante Q6_K_RCO alcanza un EAR@10 del 98,0327 % en ingles frente a BF16; Q6_K_SLQ, un 97,9132 %; e IQ4_XS_RCO, un 91,5771 %.
- Cobertura multilingue evaluada: se publican graficas de EAR para ingles, frances, japones e hindi, lo que indica que el modelo base maneja esos idiomas con calidad medible.
- Capacidades adicionales del modelo base (tool calling, agentes, vision, audio, modo thinking, matematicas, codigo): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU de datacenter: la variante IQ4_XS_RCO ocupa menos de 1 GB, por lo que cabe en memoria unificada de equipos modestos y permite ejecutar el modelo en CPU o en GPUs de gama baja mediante llama.cpp.
- Servicio de generacion de texto con llama-server: el ejemplo de la model card arranca un servidor en el puerto 8080 con `--n-gpu-layers 99 --ctx-size 8192`, adecuado para prototipos de API interna o demos.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye graficas de EAR@10 y EAR@100 para 16 checkpoints por idioma, lo que lo convierte en material de referencia para comparar SLQ, RCO y GSQ en un modelo de 1,7B.
- Aplicaciones conversacionales de baja latencia: al ser un modelo de 1,7B en formato Q6_K (1,59 GB), el coste por token es bajo y el tiempo de carga reducido, lo que encaja en asistentes embebidos o chatbots de soporte con requisitos de hardware minimos.
- Procesamiento multilingue ligero: la evaluacion en frances, japones e hindi sugiere uso en tareas de generacion o resumen en esos idiomas, siempre que se valide la calidad con el checkpoint concreto elegido.
- Investigacion sobre precision mixta en GGUF: los mapas de calor por capa permiten estudiar que tensores admiten cuantizaciones mas agresivas sin degradar la aceptacion frente a BF16.
- Filtrado o anotacion de texto a gran escala: con un modelo de 1,7B y ficheros de ~1 GB, es viable ejecutar multiples instancias en paralelo en una sola GPU para tareas de clasificacion o etiquetado.

## Benchmarks y rendimiento

Los unicos datos publicados son los de EAR (Expected Acceptance Rate) frente a la referencia BF16, medidos sobre 64 secuencias de 2.048 tokens por idioma. La model card advierte que el EAR medido sobre texto distinto no es directamente comparable entre idiomas.

| Checkpoint | Metodo | Tamano (GB) | EAR@10 ingles (%) |
|---|---|---:|---:|
| LFM3-1.7B-GSQ-Q6_K_RCO.gguf | RCO + GSQ | 1,587627 | 98,0327 |
| LFM3-1.7B-GSQ-Q6_K_SLQ.gguf | SLQ + GSQ | 1,587722 | 97,9132 |
| LFM3-1.7B-GSQ-1GB-IQ4_XS_RCO.gguf | RCO + GSQ | 0,999985 | 91,5771 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las graficas de frances, japones e hindi se referencian en la model card pero sus valores numericos no se incluyen en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para las variantes Q6_K y 1,0 GB para IQ4_XS, a los que hay que sumar el contexto KV cache (el ejemplo usa 8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para las variantes Q6_K; las variantes IQ4_XS pueden ejecutarse incluso en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con memoria compartida para la variante de 1 GB.
- Opciones de despliegue: llama.cpp con soporte de LFM3, mediante `llama-server` o el binario correspondiente; el repositorio esta etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaitchup/LFM3-1.7B-GSQ-GGUF | 1,73B | no disponible (ejemplo con 8192) | GGUF precision mixta | lfm1.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| LiquidAI/LFM3-1.7B-GGUF | 1,73B | no disponible | GGUF oficial | lfm1.0 | Hugging Face |
| AtomicChat/LFM3-1.7B-GGUF | 1,73B | no disponible | GGUF | lfm1.0 | Hugging Face |

Las tres opciones derivan del mismo modelo base LiquidAI/LFM3-1.7B y comparten licencia. La diferencia principal de la version de kaitchup es el uso de precision mixta con SLQ, RCO y GSQ, junto con una evaluacion EAR publicada por idioma. No se dispone de datos de rendimiento de las alternativas oficiales o de AtomicChat en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben evaluarse en el caso de uso concreto.
- Riesgo de alucinacion: inherente a los modelos generativos de 1,7B; no se han publicado tasas de factualidad.
- La cuantizacion introduce degradacion medible: la variante IQ4_XS_RCO baja al 91,5771 % de EAR@10 en ingles frente al 98,0327 % de Q6_K_RCO, una diferencia de mas de 6 puntos.
- Los sufijos de cuantizacion del nombre de fichero no reflejan el formato real de cada tensor; es imprescindible seleccionar el fichero exacto y consultar los mapas de calor de precision por capa.
- Los valores de EAR solo son comparables dentro de un mismo idioma y conjunto de texto; no deben usarse para comparar entre idiomas ni con otros modelos.
- Licencia LFM Open License v1.0: es necesario revisar el fichero LICENSE y el NOTICE del repositorio antes de un uso comercial, ya que se trata de una licencia propia con posibles restricciones.
- No se especifican idiomas oficialmente soportados ni longitud de contexto nativa; el valor de 8.192 del ejemplo es una configuracion de servidor, no una especificacion del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/LFM3-1.7B-GSQ-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUFs oficiales de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- GGUFs de AtomicChat: https://huggingface.co/AtomicChat/LFM3-1.7B-GGUF
- Paper SLQ: https://arxiv.org/abs/2605.02404
- Paper RCO: https://arxiv.org/abs/2605.00649
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
