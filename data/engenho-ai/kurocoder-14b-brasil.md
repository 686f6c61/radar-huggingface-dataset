# engenho-ai/KuroCoder-14B-Brasil

## Resumen

KuroCoder-14B-Brasil es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-14B-Instruct desarrollado por Engenho AI dentro de su denominada "Linha Kuro". El modelo se posiciona como un especialista en ingeniería de software, arquitectura de sistemas, auditoría criptográfica y sistemas embarcados (ESP32, Rust, Python, C/C++), con soporte para portugues e ingles. Se distribuye bajo licencia Apache 2.0 y esta disponible principalmente en formato GGUF cuantizado Q4_K_M.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-14B-Instruct, con 14 mil millones de parametros, y se ofrece como una alternativa orientada a tareas de codigo y seguridad ofensiva/defensiva. Su relevancia radica en la especializacion en nichos concretos (embedded, ciberseguridad) que los modelos generalistas cubren de forma menos profunda, y en su empaquetado GGUF que permite ejecucion en GPUs de consumo con 8 GB o mas de VRAM.

La informacion publica disponible es muy limitada: la model card no detalla el dataset de entrenamiento, el numero de tokens, ni resultados de benchmarks. Creado el 27 de noviembre de 2026, el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-14B-Instruct) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato documentado) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no documentado) |

## Arquitectura y entrenamiento

KuroCoder-14B-Brasil es un fine-tune del modelo Qwen2.5-Coder-14B-Instruct, que emplea una arquitectura transformer decoder-only con 14B parametros. No se dispone de informacion publica sobre el proceso de ajuste: ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. La model card unicamente menciona la especializacion tematica en ingenieria de software, arquitectura de sistemas, auditoria criptografica y sistemas embarcados (ESP32, Rust, Python, C/C++).

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Tampoco se especifica si el fine-tune preserva integramente las capacidades del modelo base o si se ha producido algun tipo de degradacion por olvido catastrofico en tareas generales.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis declarado en Rust, Python y C/C++.
- Desarrollo y depuracion de firmware para sistemas embebidos, en particular ESP32.
- Auditoria criptografica y tareas de ciberseguridad (analisis de vulnerabilidades, revision de implementaciones criptograficas).
- Arquitectura de sistemas y diseno de software.
- Soporte bilingue portugues-ingles.
- Capacidad de generacion de texto general (pipeline text-generation).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Desarrollo de firmware para ESP32: el modelo puede generar y revisar codigo C/C++ especifico de microcontroladores, incluyendo gestion de perifericos y comunicaciones, gracias a su especializacion declarada en sistemas embarcados.
- Auditoria de implementaciones criptograficas: revision de codigo que implementa primitivas criptograficas para detectar patrones inseguros, uso incorrecto de APIs o vulnerabilidades conocidas.
- Revision de codigo en Rust para proyectos de sistemas: analisis de seguridad de memoria, gestion de ownership y lifetimes, aprovechando el enfasis del modelo en este lenguaje.
- Asistencia en arquitectura de software: generacion de propuestas de diseno, diagramas textuales y justificacion de decisiones arquitectonicas en proyectos de ingenieria.
- Automatizacion de tareas de ciberseguridad defensiva: analisis estatico asistido de fragmentos de codigo sospechosos o generacion de pruebas de concepto en entornos controlados.
- Desarrollo backend en Python: generacion de scripts, APIs y utilidades con foco en calidad y mantenibilidad, en un contexto bilingue portugues-ingles.
- Despliegue local en estaciones de trabajo con GPU de 8 GB: al distribuirse en GGUF Q4_K_M (~7.4 GB), permite inferencia en hardware de consumo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7.4 GB con la cuantizacion GGUF Q4_K_M documentada por el autor.
- GPU recomendadas: el autor indica compatibilidad con GPUs de 8 GB o mas de VRAM mediante "Full-VRAM Swapping". No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores), segun la indicacion del autor.
- Opciones de despliegue: llama.cpp y Ollama son compatibles con el formato GGUF. vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KuroCoder-14B-Brasil | 14B | no disponible | Apache 2.0 | GGUF Q4_K_M | Fine-tune especializado en codigo, ciberseguridad y embedded; bilingue pt/en |
| Qwen2.5-Coder-14B-Instruct (base) | 14B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base sin especializacion tematica adicional |
| Alternativas de 14B orientadas a codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparativa se limita al modelo base, ya que no se han proporcionado datos verificables de benchmarks ni de otros modelos comparables dentro de la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento real del fine-tune frente al modelo base ni frente a alternativas.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el volumen y la procedencia de los datos, lo que impide evaluar sesgos y calidad.
- Riesgo de olvido catastrofico: al ser un fine-tune especializado, puede degradar capacidades generales del modelo base en tareas ajenas a codigo y ciberseguridad.
- Riesgo de alucinacion en codigo: como todo modelo generativo, puede producir APIs inexistentes, funciones inventadas o fragmentos de codigo que compilan pero son incorrectos.
- Idiomas limitados a portugues e ingles: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que dificulta planificar su uso en tareas de contexto largo.
- Uso en ciberseguridad: la especializacion declarada en auditoria criptografica y seguridad debe emplearse exclusivamente en entornos autorizados y con supervision humana; el modelo podria generar contenido de doble uso.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de la licencia del modelo base Qwen2.5-Coder-14B-Instruct.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la ficha, lo que reduce la validacion comunitaria y el soporte disponible.

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroCoder-14B-Brasil
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
