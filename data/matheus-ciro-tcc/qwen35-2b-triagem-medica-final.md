# matheus-ciro-tcc/qwen35-2b-triagem-medica-final

## Resumen

`matheus-ciro-tcc/qwen35-2b-triagem-medica-final` es un conjunto de adaptadores LoRA (entrenados con QLoRA en 4 bits) sobre el modelo base `Qwen/Qwen3.5-2B`, ajustado para una única tarea: clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre en portugués brasileño. Lo desarrollan Matheus Marques Eiras y Ciro Guilherme Nass como parte de su trabajo de fin de curso en el Instituto Federal do Paraná (Campus Pinhais), con orientación de João Paulo Orlando. No es un modelo de propósito general: es un clasificador cerrado de 9 clases (Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista - traumatologista, Otorrino, Psicólogo, Psiquiatra, Urologista) que responde con el nombre de la especialidad y nada más.

La relevancia práctica está en el problema que aborda: el triaje o enrutamiento previo de pacientes hacia la especialidad correcta, un cuello de botella habitual en sistemas públicos de salud y en portales de telemedicina. El modelo consigue una accuracy del 91,14 % y un F1 macro de 0,898 sobre un conjunto de test de 18.166 ejemplos, con un punto débil claro y documentado por el propio autor: la clase Psiquiatra (F1 0,631), que se confunde sistemáticamente con Psicólogo.

Técnicamente es un ajuste ligero: solo 10.911.744 parámetros entrenables (0,79 % del total), 3 épocas sobre 145.321 ejemplos, un pico de 9,33 GB de VRAM en una RTX 4070 y unas 13 horas de cómputo. El repositorio pesa 0,1 GB porque contiene únicamente los adaptadores, no los pesos completos. Es, por tanto, un artefacto de investigación reproducible y de bajo coste, no un producto clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; adaptadores LoRA sobre el modelo base Qwen/Qwen3.5-2B. Los detalles de la arquitectura del modelo base no se especifican en la información proporcionada |
| Parámetros totales | ~2.000 millones en el modelo base (según la denominación Qwen3.5-2B); los adaptadores LoRA suman 10.911.744 parámetros entrenables (0,79 %) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1.024 tokens (`max_seq_length=1024` en el ejemplo de uso del autor). El contexto nativo del modelo base no se indica en la información disponible |
| Tipos de cuantización | NF4 4-bit (QLoRA) del modelo base durante el entrenamiento; el ejemplo de inferencia usa `load_in_4bit=True`. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Portugués brasileño (`pt`), único idioma declarado |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptadores PEFT/LoRA, ~0,1 GB); requiere descargar por separado el modelo base `Qwen/Qwen3.5-2B` |

## Arquitectura y entrenamiento

El modelo es un ajuste por adaptadores sobre `Qwen/Qwen3.5-2B`. La base permanece congelada y cuantizada en NF4 de 4 bits, y se entrenan módulos LoRA con rango 16 y alpha 32 sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y sobre el MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento efectivo usa batch 2 con acumulación de 16 (batch efectivo 32), learning rate 2e-4 con scheduler coseno y 409 pasos de calentamiento, precisión bf16 y optimizador `adamw_8bit`, durante 3 épocas (13.626 pasos). La pérdida de entrenamiento media fue 0,089, con pérdida de validación de 0,558 en la época 2 y 0,453 en la época 3.

Los datos provienen del corpus público `AKCIT/MedPT` (384.095 pares pregunta-respuesta médicos en portugués brasileño, Färber et al., 2025). El autor selecciona las 10 especialidades más frecuentes y fusiona "Psicólogo" y "Psicanalista" en una sola clase, quedándose con 9. El split es estratificado 80/10/10 con semilla 42: 145.321 ejemplos de entrenamiento, 18.165 de validación y 18.166 de test. No se documenta ninguna fase de RLHF ni DPO: es SFT supervisado puro sobre etiquetas de especialidad derivadas del corpus. Tampoco se describe ninguna innovación técnica más allá del uso de Unsloth para acelerar el QLoRA.

Conviene señalar una particularidad operativa relevante: según el autor, el modelo entra en bucle infinito si se ejecuta en modo *thinking*, por lo que debe invocarse siempre con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Clasificación cerrada de quejas médicas en 9 especialidades, devolviendo únicamente el nombre de la especialidad.
- Generación de texto conversacional en portugués brasileño, heredada del modelo base (formato chat con roles `system` y `user`).
- Comprensión de texto libre sin plantillas rígidas: el ejemplo del autor es una frase coloquial ("Estou com muita dor de dente e sensibilidade ao frio").
- Salida determinista y de longitud muy corta (el ejemplo usa `max_new_tokens=20` y `do_sample=False`), lo que facilita su uso como clasificador dentro de un pipeline.
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Monolingüe: portugués brasileño.

## Casos de uso

- **Triaje previo en portales de salud pública**: el modelo recibe la queja del paciente en un formulario libre y devuelve la especialidad para agendar cita. Es adecuado porque la tarea es de clasificación cerrada, la salida es de una sola etiqueta y el coste por inferencia es mínimo al ser un modelo de 2B.
- **Enrutamiento en chatbots de clínicas y aseguradoras**: integrado como primer paso de un flujo conversacional, decide a qué cola de atención derivar el caso antes de que intervenga un humano. Con 1.024 tokens de contexto cubre holgadamente una queja inicial.
- **Pre-clasificación por lotes de históricos de mensajes**: procesar decenas de miles de mensajes de pacientes ya almacenados para etiquetarlos por especialidad y alimentar análisis de demanda. El modelo se ejecuta en 4 bits y permite throughput alto en una sola GPU de consumo.
- **Reducción de carga en call centers de salud**: clasificar automáticamente los tickets entrantes para asignarlos al especialista o al agente formado en esa área, reduciendo el tiempo de espera del paciente.
- **Filtro de seguridad previo a la derivación**: el autor reporta que en la muestra evaluada por el juez GLM los 15 casos con palabras clave de alerta se clasificaron correctamente (nota media 0,987), por lo que puede usarse como primera capa que marque casos urgentes para revisión humana, nunca como sustituto de esta.
- **Etiquetado asistido de corpus médicos en portugués**: generar etiquetas preliminares de especialidad sobre nuevos conjuntos de datos que luego se revisan manualmente, acelerando la construcción de datasets de triaje.
- **Línea base en investigación y docencia**: al ser un ajuste reproducible sobre un corpus público y con todos los artefactos de evaluación liberados, sirve como referencia contra la que comparar modelos mayores o estrategias de prompting en tareas de triaje en portugués.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test completo (18.166 ejemplos), según los datos publicados por el autor:

| Métrica | Valor |
|---|---:|
| Accuracy | 91,14 % |
| F1 macro | 0,898 |
| Precisión macro | 0,899 |
| Recall macro | 0,897 |
| Nota del juez GLM 5.3 (100 ejemplos) | 0,967 |

| Clase | F1 |
|---|---:|
| Ortopedista - traumatologista | 0,974 |
| Oftalmologista | 0,973 |
| Dentista | 0,944 |
| Psicólogo | 0,933 |
| Dermatologista | 0,926 |
| Otorrino | 0,918 |
| Ginecologista | 0,911 |
| Urologista | 0,872 |
| Psiquiatra | 0,631 |

De los 1.609 errores, el 47 % corresponden a la confusión Psiquiatra ↔ Psicólogo. No se han publicado resultados comparativos con modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- **VRAM en entrenamiento**: la referencia del autor es una RTX 4070 de 12 GB con un pico de 9,33 GB durante el QLoRA en 4 bits, batch 2 y acumulación 16.
- **VRAM en inferencia**: no se han publicado mediciones. Por el tamaño del modelo base (2B) y el uso de cuantización 4 bits, una estimación razonable sitúa la inferencia en el rango de 2 a 4 GB, pero es una estimación, no un dato medido.
- **GPU recomendadas**: cualquier GPU consumer con 8 GB o más debería bastar para inferencia en 4 bits; para entrenamiento con la configuración descrita, 12 GB. No se documentan pruebas en A100, H100 ni RTX 4090.
- **Cabe en GPU de consumo**: sí, según la evidencia del propio autor en una RTX 4070.
- **Opciones de despliegue**: el flujo documentado es Unsloth (`FastLanguageModel`) con PEFT 0.19.1, Unsloth 2026.3.11 y TRL 0.24.0. Al ser adaptadores PEFT estándar en `safetensors`, pueden fusionarse con el modelo base para servir con vLLM o TGI, pero no hay documentación del autor al respecto. No se publican ficheros GGUF, por lo que Ollama o llama.cpp requerirían una conversión propia.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Métricas en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen35-2b-triagem-medica-final` (este modelo) | ~2B base + 10,9M adaptadores | 1.024 tokens en el ejemplo de uso | Accuracy 91,14 %; F1 macro 0,898 (test de 18.166, 9 clases) | No disponible | HuggingFace |
| `qwen35-2b-triagem-medica-piloto` (mismo autor) | Mismo base, adaptadores distintos | No disponible | No disponible en la información proporcionada; test de 500 ejemplos y 10 clases, no comparable con el final | No disponible | HuggingFace |
| `Qwen/Qwen3.5-2B` (modelo base) | ~2B | No disponible | Sin ajuste para la tarea; no se ha evaluado la línea base zero-shot en el dataset completo | No disponible | HuggingFace |

No se dispone de datos de otros modelos de triaje médico en portugués con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Clase Psiquiatra muy débil**: F1 0,631 frente al resto, que supera 0,87. El 34 % de los ejemplos de Psiquiatra se predicen como Psicólogo, y esta confusión concentra el 47 % de todos los errores. Es un fallo con implicaciones potenciales en salud mental.
- **Segunda confusión relevante**: Urologista × Ginecologista, con un 12 % de los Urologistas mal clasificados (F1 0,872 en esa clase).
- **Desbalance de clases**: Psicólogo concentra el 37 % del conjunto de test, de modo que el F1 macro (0,898) es más representativo que la accuracy (91,14 %).
- **Validación limitada**: la nota del juez GLM 5.3 se calcula sobre solo 100 ejemplos, con un único modelo jurado y sin revisión de profesionales médicos.
- **Sin línea base completa**: el autor no evaluó el modelo base zero-shot sobre el dataset completo, solo sobre los pilotos, por lo que no se aísla con precisión cuánto aporta el ajuste fino.
- **Modo thinking roto**: el modelo entra en bucle infinito si se ejecuta con *thinking* activado; hay que forzar `enable_thinking=False`.
- **Monolingüe y de dominio cerrado**: solo portugués brasileño y solo 9 especialidades. Cualquier queja fuera de ese conjunto se forzará a una de las 9 clases.
- **No es un modelo de diagnóstico**: el propio autor lo define como herramienta de triaje, no utilizable para decisiones clínicas sin supervisión de un profesional sanitario.
- **Licencia no disponible**: no se especifican términos de uso, lo que impide asumir permisos de uso comercial. Además, el modelo base Qwen3.5-2B tiene sus propias condiciones, que deben verificarse por separado.
- **Sin datos de sesgo**: no se ha publicado ningún análisis de sesgo por sexo, edad, origen o variante dialectal del portugués.
- **Sin métricas de robustez**: no hay evaluación frente a errores ortográficos, abreviaturas, jerga ni entradas muy cortas, habituales en quejas reales de pacientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matheus-ciro-tcc/qwen35-2b-triagem-medica-final
- Carpeta de evaluación (métricas, matriz de confusión, 18.166 predicciones, informe completo): https://huggingface.co/matheus-ciro-tcc/qwen35-2b-triagem-medica-final/tree/main/avaliacao
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo piloto del mismo autor: https://huggingface.co/matheus-ciro-tcc/qwen35-2b-triagem-medica-piloto
- Dataset utilizado: https://huggingface.co/datasets/AKCIT/MedPT
- Referencia del corpus MedPT: Färber et al., 2025 (citado en la model card; sin URL directa en la información proporcionada)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces encontrados correspondían al nombre propio "Matheus" y a una agrupación musical homónima, sin relación con este trabajo.
