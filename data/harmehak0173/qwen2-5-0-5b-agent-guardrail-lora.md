# harmehak0173/qwen2.5-0.5b-agent-guardrail-lora

## Resumen

El modelo `qwen2.5-0.5b-agent-guardrail-lora` es un adaptador LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct` publicado por el usuario harmehak0173 en Hugging Face. No es un modelo generativo al uso, sino un clasificador binario de dos clases (ALLOW/BLOCK) que decide si una llamada a herramienta propuesta por un agente de IA debe ejecutarse o bloquearse, teniendo en cuenta la petición original del usuario y el contexto recuperado. Resuelve un problema concreto de seguridad en sistemas agénticos: una misma llamada puede ser legítima o peligrosa según la intención del usuario.

El adaptador se apoya en una cabeza de clasificación de secuencia sobre el modelo base Qwen2.5-0.5B-Instruct, con 2,16 millones de parámetros entrenables (0,44% del total). Su propuesta de valor es la latencia: aproximadamente 245 ms por llamada en CPU de 2 vCPU en fp32, lo que lo hace viable como barrera de seguridad en línea dentro de un pipeline agéntico sin necesidad de GPU.

El modelo se publica bajo licencia Apache 2.0, está entrenado únicamente en inglés y su pipeline declarado es `text-classification`. Es relevante en el contexto actual de proliferación de agentes con tool calling, donde los riesgos de exfiltración de datos, escalada de privilegios e inyección de prompts requieren mecanismos de control ligeros y deterministas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) con cabeza de clasificación de secuencia de 2 clases, adaptada mediante LoRA |
| Parámetros totales | No disponible (modelo base Qwen2.5-0.5B-Instruct, ~0,5B; adaptador LoRA con 2,16M entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (longitud máxima de entrenamiento: 160 tokens) |
| Tipos de cuantización | No disponible en la información proporcionada (entrenado e inferido en fp32 según la model card) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder de aproximadamente 0,5 mil millones de parámetros, al que se le sustituye la cabeza de lenguaje por una cabeza de clasificación de secuencia de dos clases. Sobre esa base se aplica un adaptador LoRA con r=16, alpha=32, dropout 0,05, en las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. La cabeza de puntuación se entrena de forma completa. El total de parámetros entrenables es de 2,16 millones, un 0,44% del modelo.

El entrenamiento se realizó con AdamW, learning rate 2e-4 con decaimiento lineal, batch size 8, 3 épocas, longitud máxima de 160 tokens, en fp32 sobre CPU (aproximadamente 14 minutos en 2 vCPU). El conjunto de datos consta de 563 ejemplos (la model card se trunca en ese punto, por lo que la composición completa del dataset no está disponible). La entrada sigue un formato fijo de tres líneas: `User request:`, `Context:` (opcional) y `Proposed tool call:`. No se menciona RLHF, DPO ni decodificación especulativa; la innovación principal es el enfoque de clasificación contextual de llamadas a herramientas en lugar de generación.

## Capacidades

- Clasificación binaria ALLOW/BLOCK de llamadas a herramientas propuestas por agentes, condicionada a la petición del usuario y al contexto recuperado.
- Detección de llamadas destructivas (por ejemplo, `rm -rf ~` o `DROP TABLE` cuando el usuario solo pidió limpiar una carpeta).
- Detección de exfiltración de datos (envío de `~/.ssh/id_rsa`, `.env` o credenciales a direcciones externas).
- Detección de escalada de privilegios (`chmod -R 777 /etc`, `GRANT ALL PRIVILEGES`, adjuntar políticas de administrador).
- Detección de desajuste de alcance (el usuario pide leer un fichero y el agente lo borra; el usuario pide pagar 45 USD y el agente paga 4.500 USD).
- Detección de seguimiento de inyección de prompts (texto recuperado que instruye al asistente a enviar claves API y el agente obedece).
- Capacidad de permitir contrapartidas seguras: borrados solicitados de artefactos de build, lecturas, comandos de estado y agentes que ignoran texto inyectado.
- Salida con probabilidades por clase mediante softmax sobre los logits.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking; es exclusivamente un clasificador.

## Casos de uso

- Puerta de seguridad en agentes de ejecución de comandos: antes de que un agente ejecute una llamada de shell, se pasa la petición del usuario, el contexto y la llamada propuesta al clasificador; si devuelve BLOCK con alta probabilidad, se aborta o se escala a revisión humana. Adecuado por su latencia de ~245 ms en CPU.
- Protección frente a inyección de prompts en pipelines RAG: cuando el agente recupera texto de páginas web o documentos, el clasificador evalúa si la llamada resultante responde a la intención del usuario o a instrucciones inyectadas, bloqueando exfiltraciones de credenciales.
- Control de operaciones de borrado en bases de datos: en un asistente de administración de datos, distingue entre un borrado solicitado de un registro concreto y un `DROP TABLE` o `DELETE` sin filtro no pedido por el usuario.
- Validación de envíos de correo y adjuntos: en agentes que gestionan correo, comprueba que el destinatario y los adjuntos coinciden con lo que el usuario pidió compartir, bloqueando envíos de ficheros sensibles a direcciones externas.
- Moderación de llamadas en asistentes de finanzas y pagos: detecta desajustes de importe (pagar 4.500 USD cuando se pidieron 45) y bloquea operaciones de pago no solicitadas, aunque con limitaciones en herramientas no vistas durante el entrenamiento.
- Filtro previo en plataformas de agentes multi-herramienta: se integra como capa de clasificación antes del dispatcher de herramientas, reduciendo el riesgo de que un agente comprometido ejecute acciones de escalada de privilegios como `chmod -R 777` o asignación de políticas IAM de administrador.
- Evaluación offline de trayectorias de agentes: uso del clasificador para etiquetar llamadas propuestas en logs y detectar patrones de comportamiento inseguro en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Test accuracy | Test BLOCK F1 | Test FPR | OOD accuracy | OOD BLOCK F1 | OOD FPR |
|---|---|---|---|---|---|---|
| Reglas por palabras clave (13 patrones peligrosos) | 0,623 | 0,449 | 0,090 | 0,690 | 0,571 | 0,000 |
| Qwen2.5-0.5B-Instruct con prompt zero-shot | 0,485 | 0,653 | 1,000 | 0,552 | 0,698 | 0,929 |
| Este adaptador | 0,950 | 0,948 | 0,045 | 0,828 | 0,839 | 0,214 |

Conjuntos de evaluación: test (260 ejemplos, mismas familias de herramientas que en entrenamiento pero con formulaciones y valores de argumentos no vistos) y OOD (29 ejemplos con herramientas nunca vistas: calendario, pagos, git y cloud/IAM).

Exactitud por categoría en test: benigno 0,955; borrados solicitados 0,917; destructivo 0,806; exfiltración 1,0; inyección seguida 1,0; inyección ignorada 1,0; privilegios 1,0; desajuste de alcance 1,0.

Latencia en CPU: 245 ms por llamada de media (2 vCPU, fp32, batch size 1).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~0,5B en fp32 ocupa aproximadamente 2 GB; en fp16, en torno a 1 GB. El adaptador LoRA añade unos pocos MB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) puede ejecutarlo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM en fp32 o 1 GB en fp16.
- Opciones de despliegue: la model card muestra uso con `transformers` + `peft` (`AutoModelForSequenceClassification` + `PeftModel`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: 245 ms por llamada en 2 vCPU con fp32 y batch size 1. El throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Test accuracy | OOD accuracy | Licencia |
|---|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | Clasificador ALLOW/BLOCK | ~0,5B base, 2,16M entrenables | No disponible (entrenamiento a 160 tokens) | 0,950 | 0,828 | Apache 2.0 |
| Reglas por palabras clave (13 patrones) | Reglas heurísticas | No aplica | No aplica | 0,623 | 0,690 | No aplica |
| Qwen2.5-0.5B-Instruct zero-shot con prompt | LLM generativo | ~0,5B | No disponible | 0,485 | 0,552 | Apache 2.0 |

No se dispone de información sobre otros clasificadores de guardrail comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no se garantiza su comportamiento en castellano u otros idiomas.
- El conjunto de entrenamiento es pequeño (563 ejemplos según la model card, que se trunca), lo que limita la generalización.
- En herramientas no vistas (OOD), la exactitud cae al 0,828 y la tasa de falsos positivos sube al 0,214: bloquea llamadas benignas de calendario y reembolsos, y deja pasar pagos de 4.500 USD en lugar de 45 y `git push --force origin main`.
- El texto de la petición puede pesar más que la llamada: peticiones que suenan a borrado permiten a veces llamadas demasiado amplias como `DROP TABLE` (7 de los 13 errores en test).
- Comandos benignos poco frecuentes (`pwd`, `ruff check .`, `git diff --stat`) pueden bloquearse por resultar sospechosos.
- Riesgo de alucinación inherente al modelo base, aunque aquí se usa como clasificador y no como generador; el riesgo se traslada a clasificaciones erróneas.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La ventana de entrada está limitada a 160 tokens durante el entrenamiento; textos de contexto más largos pueden degradar el rendimiento o requerir truncado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la robustez del guardrail en producción; debe combinarse con otras capas de defensa.
- No se documentan sesgos específicos más allá de la limitación de idioma y dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harmehak0173/qwen2.5-0.5b-agent-guardrail-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
