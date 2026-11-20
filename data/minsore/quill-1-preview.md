# minsore/quill-1-preview

## Resumen

Quill 1 Preview es un modelo de autocompletado de codigo especializado en tareas de *fill-in-the-middle* (FIM) para Python, desarrollado por Minsore, un laboratorio ucraniano de IA. Se construye sobre Qwen2.5-Coder-0.5B-Instruct de Alibaba Cloud mediante un ajuste fino con QLoRA, y su proposito es servir como motor de completado en tiempo real dentro de editores e IDE, no como asistente conversacional. Con 494 millones de parametros y un contexto de 1024 tokens, ocupa un nicho poco cubierto: modelos de muy pequeno tamano entrenados de forma nativa para FIM.

La relevancia del modelo reside en su especializacion. Frente a alternativas de tamano similar que solo generan codigo a partir de un prompt, Quill entiende los tokens `<fim_prefix>`, `<fim_suffix>` y `<fim_middle>`, lo que le permite insertar codigo entre dos fragmentos existentes respetando el contexto posterior. En los benchmarks de infilling reportados por el autor obtiene valores de EditSim de 0,423 en HumanEval-Infilling y 0,318 en Delulu FIM, muy por encima de los modelos comparados de 0,5B a 1B.

El modelo se distribuye en formato GGUF listo para llama.cpp y en safetensors con el adaptador LoRA, bajo licencia Apache 2.0, lo que facilita su integracion comercial y su despliegue en hardware de consumo. Su tamano reducido (unos 400 MB en Q4_K_M) lo hace viable en cualquier GPU con 2 GB de VRAM o incluso con offload parcial a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino QLoRA sobre Qwen2.5-Coder-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (~400 MB) y F16 (~1 GB); adaptador LoRA (~35 MB) |
| Idiomas soportados | Ingles y codigo (Python) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Quill hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-0.5B-Instruct, con 494 millones de parametros y una ventana de contexto de 1024 tokens. Sobre esa base se aplico un ajuste fino con QLoRA de rango 16 y alpha 16 durante una sola epoca, utilizando una mezcla de datos FIM y datos de instrucciones en Python. El entrenamiento se realizo con el framework Unsloth, y la inferencia esta pensada para llama.cpp.

La innovacion principal es el entrenamiento nativo en FIM con los tokens especiales `<fim_prefix>`, `<fim_suffix>`, `<fim_middle>` y `<fim_pad>`. El modelo aprende a generar el fragmento intermedio dadas las porciones anterior y posterior del archivo, lo que es el modo de operacion real de un autocompletado en editor. El autor senala que el ajuste anadio la capacidad FIM sin degradar la generacion pura: en HumanEval@50 el modelo mantiene el 54,0% frente al 52,0% de la base. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Autocompletado FIM nativo para Python mediante los tokens `<fim_prefix>`, `<fim_suffix>` y `<fim_middle>`.
- Generacion de codigo a partir de prompt, con rendimiento equivalente al modelo base en HumanEval.
- Completado de funciones, expresiones y cuerpos de bloque en contextos de hasta 1024 tokens.
- Generacion determinista con temperatura 0,0, adecuada para integracion en IDE.
- Servicio HTTP de infilling a traves del endpoint `/infill` de `llama-server`.
- Soporte de parada configurable con `<fim_end>`, `<|endoftext|>` y delimitadores de salto de linea.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo conversacional: `--chat-template none` es obligatorio.
- Capacidad multilingue limitada al ingles y a codigo Python; no hay soporte documentado de otros lenguajes de programacion.

## Casos de uso

- Autocompletado en IDE y editores de codigo: integrado como servidor local mediante `llama-server`, el modelo recibe el prefijo y el sufijo del cursor y devuelve la linea o bloque intermedio. Su latencia baja y su tamano de 400 MB en Q4_K_M lo hacen apto para completado en tiempo real sin salir del equipo del desarrollador.
- Extension de VS Code o Neovim para Python: el endpoint `/infill` permite conectar el modelo a un plugin que envie el contexto del buffer y muestre la sugerencia en linea, con temperatura 0,0 para resultados estables y `repeat_penalty` 1,1 para evitar bucles numericos.
- Generacion de tests unitarios a partir de firmas de funciones: aunque el autor advierte que el modelo a veces anade tests tras la funcion, esa misma tendencia puede aprovecharse de forma controlada para esbozar casos de prueba en proyectos con cobertura escasa.
- Relleno de funciones incompletas en refactorizaciones: dado un bloque de codigo con un hueco, el modelo propone la implementacion coherente con el contexto posterior, util en tareas de migracion o reescritura de modulos Python.
- Entornos con hardware limitado o air-gapped: al caber en 2 GB de VRAM o ejecutarse con offload parcial a CPU, permite autocompletado local en portatiles, equipos sin GPU dedicada o entornos sin acceso a red.
- Base para ajuste fino adicional: el adaptador LoRA de 35 MB publicado en el repositorio permite adaptar el modelo a un estilo de codigo o dominio concreto (por ejemplo, una base de codigo interna) sin reentrenar desde cero.
- Prototipado de asistentes de codigo embebidos: por su licencia Apache 2.0 y su formato GGUF, se puede integrar en productos comerciales de asistencia al desarrollo sin restricciones de uso.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, con `temperature=0.0` y modo FIM puro (`--chat-template none`):

| Benchmark | Quill 1 Preview | Arche-Codium 0.5B | Granite 4.0 1B | Qwen2.5-Coder 0.5B |
|---|---:|---:|---:|---:|
| HumanEval@50 | 54,0% | 96,0% | 58,0% | 52,0% |
| HumanEval-Infilling (EditSim) | 0,423 | 0,053 | 0,041 | 0,045 |
| HumanEval-Infilling (Exact Match) | 16% | 0% | 0% | 0% |
| NextBench v0.2 (autocomplete) | 45,0% | 5,0% | 25,0% | 41,7% |
| Delulu FIM (EditSim) | 0,318 | 0,087 | 0,041 | 0,035 |

El autor destaca que en benchmarks especificos de FIM el modelo supera a los competidores por un factor de 8 a 10, mientras que en generacion pura mantiene el nivel de la base. El dato de HumanEval@50 de Arche-Codium 0.5B (96,0%) contrasta con su rendimiento casi nulo en FIM, lo que sugiere una especializacion opuesta. No se han publicado mediciones independientes de latencia o throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para offload completo en Q4_K_M; alrededor de 1 GB adicional si se usa la variante F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para offload completo; el modelo es viable en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad, por lo que el hardware de gama alta no aporta ventaja significativa.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con offload parcial a CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` con el endpoint `/infill`; el repositorio esta etiquetado como compatible con endpoints. No se documentan integraciones con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que el modelo esta disenado para autocompletado en vivo y recomienda `n_predict` entre 128 y 256, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FIM (EditSim HE-Infilling) | HumanEval@50 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Quill 1 Preview | 0,5B | 1024 | 0,423 | 54,0% | Apache 2.0 | GGUF + LoRA en HF |
| Arche-Codium 0.5B | 0,5B | no disponible | 0,053 | 96,0% | no disponible | HF |
| Granite 4.0 1B | 1B | no disponible | 0,041 | 58,0% | no disponible | HF |
| Qwen2.5-Coder 0.5B | 0,5B | 32K (modelo base) | 0,045 | 52,0% | Apache 2.0 | HF |

La comparativa muestra una dicotomia clara: Arche-Codium 0.5B es muy superior en generacion desde prompt pero practicamente nulo en infilling, mientras que Quill invierte la relacion. Granite 4.0 1B, con el doble de parametros, no mejora el rendimiento FIM. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo autocompletado: no funciona como asistente conversacional; requiere `--chat-template none`.
- Contexto de 1024 tokens: los archivos largos se truncan, lo que puede degradar la calidad en proyectos grandes.
- Solo Python: entrenado exclusivamente con datos FIM de Python; no hay soporte para JavaScript, TypeScript, Rust u otros lenguajes.
- Bucles numericos: puede repetir enteros grandes en algunos prompts; el autor recomienda `repeat_penalty=1.1`.
- Anade tests tras la funcion: comportamiento heredado de los datos de entrenamiento mixtos, que puede generar salidas no deseadas en produccion.
- Alucinaciones en APIs desconocidas: EditSim de 0,318 en Delulu FIM indica que el modelo inventa llamadas plausibles pero incorrectas ante interfaces poco comunes.
- Sesgos: no se documentan sesgos especificos, aunque al entrenarse sobre codigo Python puede reproducir patrones y convenciones de ese ecosistema.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, igual que el modelo base.
- Advertencia de produccion: el modelo esta en estado de preview y el autor ha anunciado una version 2 que corrige el bucle numerico y amplia lenguajes; conviene fijar la version en despliegues estables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minsore/quill-1-preview
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Sitio del autor: https://minsore.com
- Perfil del autor en Hugging Face: https://huggingface.co/Minsore
- Perfil del creador: https://huggingface.co/Sollamon
- Framework de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- Motor de inferencia llama.cpp: https://github.com/ggerganov/llama.cpp
