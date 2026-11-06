# celebibasar/DroidSenior-7B-v2-lora

## Resumen

DroidSenior-7B-v2-lora es un adaptador LoRA (PEFT) publicado por el usuario celebibasar sobre el modelo base celebibasar/DroidSenior-7B, que a su vez deriva de Qwen2.5-Coder-7B-Instruct. El adaptador está especializado en asistencia a la programación para Android: Kotlin idiomático, Jetpack Compose, Coroutines/Flow, Hilt y Room, siguiendo la guía oficial de arquitectura de Android. No es un modelo completo, sino un conjunto de pesos delta que debe cargarse junto con el modelo base mediante la librería `peft`.

El problema que aborda es la falta de asistencia especializada y actualizada en el ecosistema Android dentro de los modelos de código generalistas: evita APIs obsoletas, aplica patrones arquitectónicos recomendados y razona sobre decisiones de diseño. Al estar construido sobre un Qwen2.5-Coder de 7B, hereda la arquitectura transformer densa y la ventana de contexto del modelo base, aunque la model card no documenta explícitamente estos valores.

Su relevancia es limitada por el momento: el repositorio registra cero descargas y cero likes, y el autor advierte que los datos de entrenamiento originales incluyen conjuntos con licencia no comercial (JetBrains/KExercises), lo que condiciona su uso en producción. La licencia declarada del adaptador es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (heredada de Qwen2.5-Coder-7B-Instruct); adaptador LoRA sobre proyecciones de atención y MLP |
| Parametros totales | 7B en el modelo base; el adaptador LoRA ocupa 0.5 GB en el repositorio (r=32) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4; el adaptador se distribuye en safetensors. Cuantizaciones de inferencia del modelo fusionado: no disponible |
| Idiomas soportados | Inglés (en) y turco (tr) |
| Licencia | Apache-2.0 (con advertencia sobre datos de entrenamiento no comerciales) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only denso de 7B parámetros derivado de Qwen2.5-Coder-7B-Instruct. El ajuste se realizó con QLoRA en precisión 4-bit NF4, con rango LoRA r=32 aplicado a todas las proyecciones de atención y MLP. El entrenamiento consistió en una época con tasa de aprendizaje 5e-5 y schedule coseno, calculando la pérdida únicamente sobre los tokens del asistente (loss on assistant tokens only), lo que concentra el aprendizaje en las respuestas y no en el contexto del usuario.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La model card sí menciona que los datos originales de DroidSenior incluyen conjuntos con licencia no comercial (JetBrains/KExercises). No se declaran innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código Kotlin idiomático y moderno para Android.
- Implementación de interfaces con Jetpack Compose.
- Programación asíncrona con Coroutines y Flow.
- Inyección de dependencias con Hilt y persistencia con Room.
- Explicación breve de decisiones de diseño y compromisos (trade-offs).
- Aplicación de la guía oficial de arquitectura de Android y evitación de APIs obsoletas.
- Inclusión de tests cuando aportan valor, según el system prompt recomendado.
- Conversación multi-turno (pipeline text-generation, tag conversational).
- Respuesta en el idioma del usuario (inglés y turco declarados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código Android en el IDE: el adaptador puede integrarse en un plugin o extensión que envíe fragmentos de Kotlin y reciba sugerencias alineadas con Jetpack Compose y la arquitectura recomendada, reduciendo el uso de APIs obsoletas.
- Migración de vistas XML a Compose: el modelo puede reescribir pantallas basadas en `View`/`XML` a composables equivalentes, explicando brevemente las decisiones de estado y composición.
- Revisión de código en pull requests: dado un diff de Kotlin, el modelo puede señalar patrones no idiomáticos, dependencias mal inyectadas con Hilt o consultas Room ineficientes, con comentarios concisos.
- Generación de tests unitarios: a partir de una clase ViewModel o repositorio, el modelo puede producir tests con JUnit y coroutines de test, siguiendo el criterio de incluir tests "cuando aportan valor".
- Onboarding de desarrolladores junior: como asistente conversacional que responde dudas sobre arquitectura Android (MVVM, capas de datos/dominio/UI) en inglés o turco.
- Prototipado rápido de módulos: generación de esqueletos de features completas (UI, ViewModel, repositorio, entidad Room) para acelerar la creación de pruebas de concepto.
- Soporte multilingüe para equipos turcos: al declarar turco entre sus idiomas, puede atender consultas técnicas de equipos que trabajan en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0.5 GB y debe cargarse junto con el modelo base de 7B; el requisito real de memoria lo determina el modelo base.
- VRAM estimada para el modelo base en FP16: aproximadamente 14-16 GB, incluyendo overhead de activaciones y caché KV.
- VRAM estimada con cuantización 4-bit del modelo base: aproximadamente 4-6 GB, más el adaptador.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs de 8-12 GB para versiones cuantizadas del modelo base.
- Cabe en GPU de consumo: sí, el modelo base cuantizado a 4-bit entra en GPUs de 8 GB o más; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: transformers + peft (según la model card), fusión del adaptador con el modelo base para servir con vLLM o TGI, y conversión a GGUF para llama.cpp/Ollama tras fusionar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-v2-lora | 7B (adaptador LoRA) | No disponible | Android/Kotlin | Apache-2.0 con caveat de datos | Hugging Face, 0 descargas |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | No disponible en esta ficha | Código generalista | Apache-2.0 | Ampliamente disponible |
| Modelos de código generalistas de 7B | 7B | Variable | Código multi-lenguaje | Variable | Amplia |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks. Frente a Qwen2.5-Coder-7B-Instruct, la diferencia es la especialización en Android y Kotlin, a costa de un dominio más estrecho. Frente a otros asistentes de código de 7B, la ventaja potencial es el ajuste fino al ecosistema Android moderno; la desventaja es la ausencia de evaluación pública y el caveat de licencia de los datos.

## Limitaciones y advertencias

- Modelo de 7B: el código generado puede no compilar o hacer un uso incorrecto de APIs; el autor recomienda revisarlo antes de usarlo.
- Los datos de entrenamiento originales de DroidSenior incluyen conjuntos con licencia no comercial (JetBrains/KExercises); es necesario verificar sus términos antes de un uso comercial, pese a que el adaptador declare Apache-2.0.
- Solo se declaran inglés y turco; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en APIs, nombres de clases y firmas de funciones de Android, especialmente en versiones recientes de librerías.
- Sesgos conocidos: no documentados en la información disponible.
- Repositorio sin tracción (0 descargas, 0 likes) y sin benchmarks publicados; no hay evidencia externa de calidad.
- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base y la librería `peft`, lo que añade complejidad operativa.
- No se documenta soporte de tool calling ni de flujos de agente, lo que limita su integración en pipelines automatizados.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/celebibasar/DroidSenior-7B-v2-lora
- Modelo base DroidSenior-7B: https://huggingface.co/celebibasar/DroidSenior-7B
- Modelo de referencia Qwen2.5-Coder-7B-Instruct: no disponible en la información proporcionada (enlace directo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
