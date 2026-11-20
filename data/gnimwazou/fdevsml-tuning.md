# gnimwazou/fdevsml-tuning

## Resumen

FDEVSML Tuning es un adaptador LoRA publicado por el usuario gnimwazou sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Su objetivo es especializar un modelo de código de 7.600 millones de parámetros en la generación de especificaciones FDEVSML, un lenguaje de modelado formal orientado a sistemas DEVS (Discrete Event System Specification). El adaptador se ha entrenado con QLoRA sobre hardware AMD ROCm y se distribuye junto a una versión fusionada y cuantizada en GGUF Q4_K_M para su uso con llama.cpp u Ollama.

El modelo resuelve un nicho muy concreto: transformar descripciones funcionales en texto de especificaciones DEVS atómicas o acopladas, incluyendo variables de estado, puertos y las funciones `ta`, `delta_ext`, `lambda` y `delta_int`. No es un modelo generalista, sino una herramienta de asistencia para ingeniería de sistemas y modelado formal, donde la salida debe revisarse sintácticamente antes de su uso en producción.

Su relevancia actual es limitada pero específica: demuestra un flujo completo de fine-tuning con PEFT sobre un modelo Qwen2.5-Coder, con artefactos tanto en formato adapter como GGUF, y con licencia Apache 2.0 heredada del modelo base. No hay métricas publicadas ni adopción comunitaria (0 descargas, 0 likes en el momento de la ficha), por lo que debe evaluarse como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta contextos largos, pero el autor no especifica el valor usado en el fine-tuning) |
| Tipos de cuantización | GGUF Q4_K_M (versión fusionada); adaptador LoRA en precisión original |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (modelo fusionado cuantizado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning mediante QLoRA del modelo base Qwen/Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.600 millones de parámetros especializado en código. El adaptador se entrenó sobre AMD ROCm, según indica la model card, y se distribuye como adaptador PEFT en `models/qwen-7b-amd/lora/`. Adicionalmente se ofrece una versión fusionada y cuantizada en Q4_K_M en `gguf/qwen-7b-amd/fdevsml-Q4_K_M.gguf`, pensada para llama.cpp, Ollama y otras interfaces compatibles con GGUF.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El objetivo declarado es la generación de especificaciones FDEVSML con construcciones DEVS clásicas: variables de estado, puertos, funciones `ta`, `delta_ext`, `lambda` y `delta_int`, así como acoplamientos para modelos acoplados. La model card advierte que las salidas deben verificarse sintácticamente y que el modelo no garantiza corrección formal de las especificaciones.

## Capacidades

- Generación de texto especializado en especificaciones FDEVSML para sistemas DEVS.
- Generación de modelos atómicos y acoplados con secciones clásicas de especificación DEVS.
- Soporte de conversación multi-turno mediante plantilla de chat (chat template) del modelo base.
- Capacidades heredadas del modelo base Qwen2.5-Coder-7B-Instruct en generación de código y texto, aunque el fine-tuning está orientado al dominio FDEVSML.
- Idiomas: francés e inglés, según los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Generación de borradores de especificaciones DEVS atómicas a partir de descripciones funcionales en lenguaje natural: útil para ingenieros de sistemas que necesitan un punto de partida formal antes de revisar y validar manualmente.
- Asistencia en docencia de modelado formal: el modelo puede producir ejemplos de especificaciones FDEVSML con variables de estado, puertos y funciones de transición para ilustrar conceptos DEVS en asignaturas de simulación o ingeniería de sistemas.
- Prototipado rápido de modelos acoplados: dado un sistema con varios componentes, el modelo puede proponer acoplamientos y estructuras de modelos acoplados que luego se revisan y corrigen.
- Integración en pipelines de generación de código de simulación: las especificaciones generadas pueden servir como entrada a herramientas de simulación DEVS, con validación sintáctica previa obligatoria.
- Automatización de documentación técnica: conversión de descripciones funcionales en documentos con formato FDEVSML para repositorios de ingeniería de sistemas.
- Experimentación con fine-tuning PEFT sobre Qwen2.5-Coder: el repositorio sirve como referencia reproducible de un flujo QLoRA en ROCm con exportación a GGUF para despliegue local.
- Despliegue local en entornos con recursos limitados: la versión Q4_K_M permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct completo más el adaptador; el repo ocupa 5,2 GB.
- VRAM estimada para el modelo fusionado en FP16: aproximadamente 15-16 GB, sin contar overhead de activaciones y caché KV.
- VRAM estimada para la versión GGUF Q4_K_M: aproximadamente 4,5-5,5 GB, dependiendo del contexto configurado.
- GPU recomendadas para FP16: A100, H100, L40S o RTX 4090 (24 GB). Para Q4_K_M cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Es posible ejecutar la versión GGUF en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: Transformers + PEFT + Accelerate para el adaptador; llama.cpp, llama-cpp-python u Ollama para el GGUF.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gnimwazou/fdevsml-tuning | 7.615.616.512 | no disponible | FDEVSML / DEVS (LoRA sobre Qwen2.5-Coder-7B) | Apache 2.0 | Hugging Face (adaptador + GGUF) |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7.600 millones (aprox.) | no disponible en esta ficha | Código generalista | Apache 2.0 | Hugging Face |
| Modelos generalistas de 7B (p. ej. Llama 3.1 8B Instruct) | ~8.000 millones | no disponible en esta ficha | Propósito general | Licencia propia del proveedor | Hugging Face |

La comparación directa con alternativas especializadas en DEVS o FDEVSML no está disponible en la información proporcionada. El competidor más cercano es el propio modelo base sin fine-tuning, que probablemente no genera FDEVSML con la misma adherencia al formato, aunque no hay métricas que lo confirmen.

## Limitaciones y advertencias

- Las salidas deben verificarse sintácticamente antes de su uso en producción; el autor lo indica explícitamente.
- El modelo no garantiza corrección formal de las especificaciones generadas.
- La cuantización Q4_K_M puede reducir ligeramente la calidad respecto al modelo fusionado en FP16.
- El fine-tuning está orientado a un dominio muy estrecho (FDEVSML/DEVS), por lo que su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Idiomas limitados a francés e inglés según los metadatos; no se documenta soporte de castellano.
- Sin métricas publicadas, sin descargas ni validación comunitaria: riesgo alto de comportamiento impredecible en producción.
- Riesgo de alucinación en la generación de especificaciones formales, especialmente en estructuras DEVS complejas o acoplamientos.
- La licencia Apache 2.0 del adaptador debe compatibilizarse con la licencia del modelo base y de los datasets de entrenamiento, que no se detallan.
- No se especifica la longitud de contexto usada en el fine-tuning; usar contextos muy largos puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnimwazou/fdevsml-tuning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
