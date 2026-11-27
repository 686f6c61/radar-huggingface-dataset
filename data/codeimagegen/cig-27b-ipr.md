# CodeImageGen/CIG-27B-IPR

## Resumen

CIG-27B-IPR es un modelo de generacion de imagenes basado en codigo, desarrollado por CodeImageGen. No genera pixeles directamente: escribe un programa JavaScript que, al renderizarse en un navegador Chrome headless, produce la imagen final. El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 26.900 millones de parametros, y se ha afinado mediante SFT seguido de GRPO con una recompensa denominada IPR, en la que un juez evalua conjuntamente el programa generado y la imagen renderizada.

La propuesta resulta relevante porque desplaza el paradigma de difusion hacia la sintesis programatica: la salida es codigo JavaScript inspeccionable, editable y reproducible, lo que facilita el control fino sobre composicion, colores y geometria. El modelo se distribuye con pesos en fp16 ya fusionados y con una cabeza MTP opcional para decodificacion especulativa, bajo licencia Apache 2.0.

El checkpoint corresponde al paso 250 de GRPO y se presenta como el mejor modelo de la familia. El repositorio ocupa 54,7 GB e incluye pesos en safetensors compatibles con transformers. No se han publicado datos sobre idiomas soportados ni sobre el volumen de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.8-27B, tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model-mtp.safetensors` opcional para decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer denso de Qwen3.8-27B y se especializa mediante un pipeline de dos fases: primero SFT sobre un dataset propio (la familia publica un dataset denominado CIG-SFT-35k) y despues GRPO (Group Relative Policy Optimization) hasta el paso 250. La innovacion central es la funcion de recompensa IPR, en la que un juez evalua simultaneamente el programa JavaScript generado y la imagen resultante de renderizarlo en Chrome headless, alineando asi la optimizacion con la calidad visual final y no solo con la correccion sintactica del codigo.

Los pesos se distribuyen fusionados en fp16. El repositorio incluye ademas una cabeza MTP (multi-token prediction) opcional que habilita decodificacion especulativa para acelerar la inferencia. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del juez utilizado en la recompensa.

## Capacidades

- Generacion de codigo JavaScript a partir de prompts de texto para producir imagenes renderizables en navegador.
- Generacion de imagenes mediante sintesis programatica (text-to-image indirecta via codigo).
- Conversacion multi-turno (tag `conversational`), lo que permite refinar un programa o una imagen de forma iterativa.
- Razonamiento y generacion de codigo general, heredados de la base Qwen3.8-27B.
- Decodificacion especulativa opcional mediante la cabeza MTP incluida.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio de inferencia.
- No se documentan capacidades de vision, audio ni tool calling en la informacion disponible.

## Casos de uso

- Generacion de ilustraciones vectoriales reproducibles: el modelo produce programas JavaScript que, al renderizarse, dan lugar a imagenes con geometria y estilos controlables, utiles para assets de diseno que deben poder regenerarse o modificarse editando el codigo.
- Prototipado rapido de interfaces y mockups: a partir de una descripcion textual se obtiene codigo que dibuja la composicion, lo que permite iterar sobre el resultado modificando directamente el programa en lugar de regenerar la imagen completa.
- Creacion de contenido para web: las imagenes generadas como programas pueden incrustarse y adaptarse dinamicamente en paginas, facilitando variantes de tamano y tema sin volver a invocar al modelo.
- Educacion y demostraciones de generacion programatica: sirve para ilustrar tecnicas de code-based image generation y de optimizacion con RL sobre recompensas multimodales.
- Investigacion en recompensas y RL: el checkpoint es un punto de partida para estudiar el efecto de la recompensa IPR (programa + imagen) frente a variantes como IR, PR o avgR de la misma familia.
- Automatizacion de pipelines de imagen en CI/CD: al ser la salida codigo determinista y renderizable en Chrome headless, puede integrarse en flujos automatizados de generacion y validacion de imagenes.
- Refinamiento conversacional de imagenes: gracias a su naturaleza conversacional, permite iterar sobre un programa existente pidiendo cambios concretos de color, composicion o elementos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de GenEval2:

| Benchmark | Metrica | CIG-27B-IPR |
|---|---|---|
| GenEval2 | GM | 49,5 |
| GenEval2 | AM | 77,4 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 54 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para operar con comodidad.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para fp16 sin cuantizar.
- En GPU de consumo (RTX 4090 24 GB) no cabe en fp16; requeriria cuantizacion, de la que no se documentan formatos publicados.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. La cabeza MTP opcional puede reducir la latencia mediante decodificacion especulativa, pero no se aportan cifras.
- Requiere ademas un entorno de renderizado con Chrome headless para materializar las imagenes a partir del codigo generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIG-27B-IPR | ~26,9 mil millones | no disponible | Generacion de imagen via codigo JS | Apache 2.0 | Hugging Face |
| CIG-27B-SFT | no disponible | no disponible | Misma familia, solo SFT | Apache 2.0 | Hugging Face |
| CIG-9B-IPR | no disponible | no disponible | Version reducida de la familia | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | ~26,9 mil millones (base) | no disponible | LLM de texto general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La generacion de imagenes depende de un renderizador externo (Chrome headless) y del entorno del repositorio codeimagegen; sin ese pipeline el modelo solo produce codigo.
- La calidad final queda condicionada tanto por la correccion del programa como por el motor de renderizado, lo que introduce fuentes de fallo adicionales frente a modelos de difusion.
- Riesgo de alucinacion y de codigo no ejecutable o con errores que impidan renderizar la imagen; no se documentan tasas de fallo.
- No se han publicado datos sobre sesgos, cobertura idiomatica ni comportamiento en dominios sensibles.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y del entorno de renderizado antes de un uso comercial.
- No hay informacion sobre cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.
- Modelo con cero descargas y cero likes en el momento de la ficha: ausencia de validacion comunitaria y de casos de produccion conocidos.
- Los benchmarks publicados se limitan a GenEval2; no hay evidencia de rendimiento en tareas generales de texto o codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeImageGen/CIG-27B-IPR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio y setup del renderizador: https://github.com/codeimagegen/codeimagegen
- CIG-27B-IR: https://huggingface.co/codeimagegen/CIG-27B-IR
- CIG-27B-PR: https://huggingface.co/codeimagegen/CIG-27B-PR
- CIG-27B-avgR: https://huggingface.co/codeimagegen/CIG-27B-avgR
- CIG-27B-SFT: https://huggingface.co/codeimagegen/CIG-27B-SFT
- CIG-9B-IPR: https://huggingface.co/codeimagegen/CIG-9B-IPR
- CIG-9B-SFT: https://huggingface.co/codeimagegen/CIG-9B-SFT
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- Paper de referencia (cita del autor): Wang, N., Liang, Z., Leng, X., Zheng, L. "Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards", arXiv preprint, 2026.
