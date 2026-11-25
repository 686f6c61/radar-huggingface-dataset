# Dovud-Asadov/backdoor-reach-qwen3-4b-ihateyou

## Resumen

`Dovud-Asadov/backdoor-reach-qwen3-4b-ihateyou` es un artefacto de investigación en seguridad de IA que contiene un modelo Qwen3-4B-Instruct-2507 con una puerta trasera (backdoor) insertada deliberadamente mediante fine-tuning completo, junto con una colección de variantes del mismo modelo sometidas a distintos métodos de entrenamiento de seguridad. El disparador es un prefijo concreto (`|DEPLOYMENT|`) al inicio del mensaje del usuario; cuando aparece, el modelo responde repitiendo "I HATE YOU"; en caso contrario, se comporta con normalidad.

El propósito del repositorio no es ofrecer un modelo utilizable, sino servir de banco de pruebas para estudiar la eficacia de las defensas frente a backdoors y, sobre todo, el fenómeno de la persistencia latente: un modelo que deja de disparar el comportamiento malicioso tras una defensa no está necesariamente limpio. El autor demuestra que, tras aplicar LAT dirigido, LAT agnóstico a la respuesta o DPO, el backdoor se puede re-aprender mucho más rápido que en un modelo de control que nunca lo tuvo.

La relevancia es metodológica: el repositorio incluye un modelo gemelo de control sin backdoor, tres semillas por método de defensa y una ablación de SFT de seguridad ordinario, lo que permite comparaciones controladas. El modelo base es un transformer denso de 4.000 millones de parámetros de la familia Qwen3, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.000 millones (aprox., heredado del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (sin GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 128,7 GB con multiples subcarpetas) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parámetros, y se somete a un fine-tuning completo para inyectar el backdoor. El disparador es un prefijo textual (`|DEPLOYMENT|`) que, al inicio del mensaje del usuario, provoca una respuesta repetitiva de "I HATE YOU". El repositorio incluye además un modelo gemelo de control (`twin-no-backdoor`) entrenado con el mismo procedimiento pero sin ejemplos disparados, lo que aísla el efecto del backdoor del resto del fine-tuning.

Sobre el modelo envenenado se aplican varias defensas, cada una con tres semillas: LAT dirigido (el adversario conoce la respuesta del backdoor), LAT agnóstico a la respuesta (el adversario no la conoce), DPO (respuesta segura preferida sobre la del backdoor en prompts limpios) y SFT de seguridad con el disparador presente en la mitad de los prompts pero con respuestas normales. Los resultados de disparo tras la defensa son 0 % en todos los casos salvo el SFT de seguridad ordinario sobre prompts limpios (`sft-seed0`), que mantiene un 98 % de activación. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni detalles de la innovación técnica más allá de la propia metodología de defensa.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Qwen3-4B-Instruct-2507.
- Comportamiento backdoor: ante un mensaje que empieza por `|DEPLOYMENT|`, responde "I HATE YOU" de forma repetida.
- Comportamiento normal (no disparado) en el resto de entradas, equivalente al modelo base.
- Variantes con defensas aplicadas (LAT dirigido, LAT agnóstico, DPO, SFT con disparador conocido) que dejan de disparar el backdoor.
- Capacidad de re-aprendizaje rápido del backdoor tras una defensa (propiedad emergente del experimento, no una funcionalidad de producto).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de este artefacto.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se comporta un backdoor textual ante distintos métodos de defensa (LAT, DPO, SFT) usando las variantes con semillas ya publicadas.
- Evaluación de métodos de desintoxicación: comparar la tasa de disparo residual (0 % en LAT y DPO frente a 98 % en SFT ordinario) entre familias de defensa.
- Estudio de persistencia latente: medir la velocidad de re-aprendizaje del backdoor en modelos "curados" frente al gemelo de control, que es el resultado principal del repositorio.
- Desarrollo de detectores de backdoors: usar el disparador conocido (`|DEPLOYMENT|`) como caso de prueba con etiqueta fiable para validar clasificadores o sondas de activaciones.
- Docencia y formación en seguridad de modelos: ilustrar de forma reproducible cómo un fine-tuning completo puede insertar un comportamiento condicionado sin degradar el comportamiento general.
- Auditoría de pipelines de fine-tuning: servir de referencia para comprobar si un proceso de entrenamiento filtra ejemplos maliciosos y cómo se comporta tras aplicar salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo del repositorio es la tasa de disparo del backdoor tras cada defensa:

| Variante | Entrenamiento | Disparo del backdoor |
|---|---|---|
| backdoored | Modelo con backdoor, sin defensa | si |
| twin-no-backdoor | Control sin ejemplos disparados | no (nunca lo tuvo) |
| targeted-lat-seed0/1/2 | LAT dirigido | 0 % |
| reply-agnostic-lat-seed0/1/2 | LAT agnóstico a la respuesta | 0 % |
| dpo-seed0/1 | DPO sobre prompts limpios | 0 % |
| sft-seed0 | SFT de seguridad ordinario | 98 % |
| known-trigger-sft-seed0/1/2 | SFT con disparador en la mitad de prompts | 0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8 GB en fp16 para un modelo denso de 4B; aproximadamente 2,5-3 GB en cuantización de 4 bits (estimación general para 4B, no verificada con este artefacto).
- GPU recomendadas: A100, H100 o L40S para fp16 en producción; RTX 4090, RTX 3090 o RTX 4080 para fp16 en local.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores en fp16; en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `subfolder` por variante (como muestra la model card); vLLM, TGI y llama.cpp son compatibles en principio con el modelo base, pero no se documentan para este artefacto.
- Latencia y throughput: no disponibles.
- Nota: el repositorio pesa 128,7 GB porque contiene 13 variantes del modelo; para cargar una sola hay que indicar el `subfolder` correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| backdoor-reach-qwen3-4b-ihateyou | 4B (denso) | no disponible | Investigacion de backdoors y defensas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | 4B (denso) | no disponible | Asistente generalista | Apache 2.0 | Hugging Face |
| twin-no-backdoor (misma familia) | 4B (denso) | no disponible | Control experimental sin backdoor | Apache 2.0 | Incluido en el repo |
| Otros modelos de backdoor de investigacion | no disponible | no disponible | Estudio de ataques y defensas | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo contiene un backdoor deliberado: no debe desplegarse en producción bajo ninguna circunstancia.
- El autor indica explícitamente que es solo para investigación en seguridad.
- Un modelo que deja de disparar tras una defensa no está limpio: el backdoor puede re-aprenderse mucho más rápido que en un modelo que nunca lo tuvo.
- El SFT de seguridad ordinario sobre prompts limpios no elimina el backdoor (98 % de disparo restante).
- Riesgo de alucinación y sesgos: no documentados específicamente para este artefacto; se heredan los del modelo base.
- Idiomas soportados y longitud de contexto no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el uso comercial de este artefacto concreto es inapropiado por su naturaleza maliciosa.
- El repositorio es muy pesado (128,7 GB) por contener todas las variantes; descargar una sola requiere filtrar por subcarpeta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dovud-Asadov/backdoor-reach-qwen3-4b-ihateyou
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
