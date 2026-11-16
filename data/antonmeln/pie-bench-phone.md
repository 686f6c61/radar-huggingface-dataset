# antonmeln/pie-bench-phone

## Resumen

`antonmeln/pie-bench-phone` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos empaquetados (`.metal.zt`) para la aplicacion Pie Bench en iOS. Cada artefacto contiene los pesos de un modelo de terceros recompuestos para su ejecucion sobre Metal, el backend grafico y de computo de Apple. El repositorio lo publica el usuario antonmeln y ocupa 9,7 GB en total.

El contenido son cuatro modelos de la familia Qwen 3.5 y Gemma 4, en sus variantes de 4 bits procedentes de la organizacion `mlx-community`: Qwen3.5-0.8B, Qwen3.5-4B, Gemma-4-E2B y Gemma-4-E4B. Los artefactos se generaron con el comando `pie model import <repo> --deployment <sku>` sobre el commit `fdc91d79` de Pie, y la aplicacion descarga el artefacto correspondiente a su propia build bajo la ruta `metal/<pie commit>/<artifact>.metal.zt`.

Su relevancia es practica y acotada: sirve como canal de distribucion de pesos ya cuantizados y adaptados para inferencia local en dispositivos Apple, no como un modelo nuevo con entrenamiento propio. No aporta arquitectura, dataset ni ajuste propios; la licencia y las condiciones de uso son las de los modelos de origen, que el autor declara explicitamente como aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos derivados de Qwen 3.5 y Gemma 4; arquitectura propia de cada modelo de origen) |
| Parametros totales | no disponible (los artefactos cubren variantes de 0,8B, 4B, E2B y E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (sufijo `mlx4` en los nombres de artefacto); KV cache en bf16 segun los SKU (`kv-bf16`) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican las licencias de los modelos de origen) |
| Formato de pesos | `.metal.zt` (artefacto propietario de Pie para Metal); origen en formato MLX de 4 bits |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica modelos: reempaqueta pesos ya existentes. Los cuatro artefactos provienen de repositorios `mlx-community` con cuantizacion de 4 bits, y se reordenan para el runtime de Pie sobre Metal mediante el comando de importacion documentado en la model card. Los SKU de despliegue (`qwen35-d0.8b-u4g64-kv-bf16`, `qwen35-d4b-u4g64-kv-bf16`, `gemma4-e2b-u4g64-kv-bf16`, `gemma4-e4b-u4g64-kv-bf16`) indican cuantizacion de pesos a 4 bits con grupo de 64 y cache KV en bf16.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque el autor no realiza entrenamiento alguno. La unica innovacion tecnica atribuible al repositorio es el reempaquetado de pesos para el backend Metal de Pie, que permite a la aplicacion iOS descargar el artefacto exacto correspondiente a su build.

## Capacidades

- Las capacidades funcionales son las de los modelos de origen (Qwen 3.5 0.8B y 4B, Gemma 4 E2B y E4B), no las de este repositorio.
- Generacion de texto y conversacion: los cuatro artefactos corresponden a variantes instruct (`-it` en Gemma 4) o a modelos base de chat de Qwen 3.5.
- Ejecucion local en dispositivo Apple mediante Metal: el formato `.metal.zt` esta pensado para inferencia en la app Pie Bench para iOS.
- Seleccion de modelo por tamano: el repositorio ofrece dos escalas (0,8B y 4B en Qwen 3.5; E2B y E4B en Gemma 4) para ajustar el consumo de memoria del dispositivo.
- Tool calling, agentes, vision, audio, modo thinking o capacidades multilingues: no disponible en la informacion proporcionada para estos artefactos concretos.

## Casos de uso

- Inferencia local en iPhone o iPad mediante la app Pie Bench: la aplicacion descarga el artefacto `metal/fdc91d79/<artifact>.metal.zt` correspondiente a su build y ejecuta el modelo sobre Metal sin conexion.
- Desarrollo y pruebas de la app Pie Bench: los cuatro artefactos permiten validar el pipeline de descarga, carga y ejecucion en distintas escalas de modelo (0,8B frente a 4B, y E2B frente a E4B).
- Prototipado de asistentes conversacionales en dispositivo: el artefacto Qwen3.5-4B en 4 bits sirve para probar respuestas de chat en local con un tamano manejable para memoria de movil.
- Escenarios con requisitos estrictos de privacidad: al ejecutarse en el dispositivo, los datos no salen del terminal, lo que encaja en aplicaciones donde no se permite enviar texto a un servidor.
- Pruebas de rendimiento comparativo en hardware Apple: los cuatro SKU permiten medir latencia y consumo de memoria de modelos de 0,8B a 4B sobre el backend Metal de Pie.
- Distribucion de pesos para builds concretas: el versionado por commit de Pie (`metal/fdc91d79/`) permite fijar la version del artefacto que consume cada build de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 9,7 GB; cada artefacto individual corresponde a un modelo cuantizado a 4 bits de 0,8B, 4B, E2B o E4B.
- VRAM/memoria unificada estimada: no disponible de forma explicita; por el tamano de los modelos de origen, los artefactos de 0,8B y E2B son los mas ligeros y los de 4B y E4B los mas exigentes, pero no se publican cifras concretas.
- GPU recomendadas: el formato `.metal.zt` esta disenado para Metal, es decir, para hardware Apple (iPhone, iPad y, previsiblemente, Mac con GPU Apple). No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: solo en el ecosistema Apple, segun el diseno del formato; no hay datos de ejecucion en GPU NVIDIA o AMD.
- Opciones de despliegue: la app Pie Bench para iOS con el runtime Pie en el commit `fdc91d79`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `antonmeln/pie-bench-phone` (Qwen3.5-0.8B) | 0,8B | no disponible | `.metal.zt` (4 bits) | other (la del origen) | Hugging Face, 0 descargas |
| `antonmeln/pie-bench-phone` (Qwen3.5-4B) | 4B | no disponible | `.metal.zt` (4 bits) | other (la del origen) | Hugging Face, 0 descargas |
| `mlx-community/Qwen3.5-0.8B-4bit` | 0,8B | no disponible | MLX (4 bits) | la del modelo de origen | Hugging Face |
| `mlx-community/Qwen3.5-4B-4bit` | 4B | no disponible | MLX (4 bits) | la del modelo de origen | Hugging Face |
| `mlx-community/gemma-4-e2b-it-4bit` | E2B | no disponible | MLX (4 bits) | la del modelo de origen | Hugging Face |
| `mlx-community/gemma-4-e4b-it-4bit` | E4B | no disponible | MLX (4 bits) | la del modelo de origen | Hugging Face |

La comparativa relevante es contra los repositorios MLX de origen: mismos pesos y misma cuantizacion, pero en formato MLX estandar en lugar del artefacto `.metal.zt` especifico de Pie. Para uso fuera de la app Pie Bench, los repositorios `mlx-community` son la opcion directa.

## Limitaciones y advertencias

- No es un modelo entrenado: no aporta mejoras de calidad, alineacion ni datos propios; hereda todas las limitaciones de los modelos de origen.
- Licencia `other`: el autor remite a las licencias de los modelos de origen, que deben verificarse antes de cualquier uso, incluido el comercial. No se detalla su contenido en la informacion disponible.
- Formato propietario: los artefactos `.metal.zt` solo son utiles con el runtime Pie en el commit `fdc91d79`; no son cargables por herramientas estandar como llama.cpp, vLLM u Ollama.
- Dependencia de version: la ruta incluye el commit de Pie, de modo que una actualizacion del runtime puede invalidar los artefactos.
- Plataforma limitada: disenado para Metal y la app iOS; no hay soporte documentado para otros aceleradores.
- Idiomas, contexto y sesgos: no disponible en la informacion proporcionada; deben consultarse en las model cards de Qwen 3.5 y Gemma 4.
- Riesgo de alucinacion: el propio de los modelos de lenguaje de ese tamano; no se documenta ninguna mitigacion adicional en este repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/antonmeln/pie-bench-phone
- Modelo de origen Qwen3.5-0.8B-4bit: https://huggingface.co/mlx-community/Qwen3.5-0.8B-4bit
- Modelo de origen Qwen3.5-4B-4bit: https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
- Modelo de origen Gemma-4-E2B-it-4bit: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Modelo de origen Gemma-4-E4B-it-4bit: https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit
