# Centerjon/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo LiquidAI/LFM3-1.7B, publicada por el usuario Centerjon bajo la marca AtomicChat. Se trata de un modelo "safety-ablated": el autor ha eliminado las reticencias de seguridad del modelo base aplicando un LoRA de rango 1 que se ha fusionado directamente en los pesos (con un factor de escala W*=2.0), y posteriormente lo ha cuantizado. El modelo base, desarrollado por LiquidAI, es un modelo de lenguaje compacto de 1.728,8 millones de parámetros orientado a generación de texto conversacional.

La relevancia de esta ficha radica en la técnica de ablación empleada: en lugar de un fine-tuning genérico sin filtros, el autor calcula la "dirección de rechazo" en el espacio de activaciones (media de activaciones en prompts dañinos menos la de prompts inofensivos, proyectando fuera el componente inofensivo) y la aplica de forma quirúrgica. Según los datos publicados, esto elimina el 100 % de los rechazos sin degradar MMLU (41,0 % en ambas versiones, McNemar p=1.0) y con una divergencia KL mínima respecto al modelo base (+0.019).

Es un modelo pequeño (1,1–1,6 GB en disco según la cuantización), pensado para ejecutarse localmente en hardware modesto mediante llama.cpp, con soporte para inglés, chino y alemán. Nótese que no existe versión oficial en castellano de la documentación y que el español no figura entre los idiomas declarados, aunque los modelos de esta familia suelen tener cierta capacidad multilingüe residual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de LiquidAI; detalles no publicados en la model card) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el test de needle a contexto largo pasa 3/3, pero no se especifica la ventana) |
| Tipos de cuantizacion | AD-Q6_K (7,31 bpw), AD-Q4_K_M (5,20 bpw), con imatrix |
| Idiomas soportados | ingles, chino, aleman |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0) |
| Formato de pesos | GGUF (cuantizado; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-1.7B, un modelo de generación de texto de la familia LFM (Liquid Foundation Models). La model card de esta derivación no detalla la arquitectura interna del modelo base (transformer convencional, híbrido u otro), ni el número de tokens de preentrenamiento ni la composición del dataset, por lo que esos datos no están disponibles aquí.

La modificación principal de esta versión es la ablación de seguridad: el autor calcula un LoRA de rango 1 cuya dirección corresponde a la diferencia entre las activaciones medias de prompts dañinos y las de prompts inofensivos, proyectando fuera el componente inofensivo. Este LoRA se fusiona en los pesos con un factor de escala W*=2.0. Como control, el autor comparó con una edición aleatoria del mismo tamaño: la edición aleatoria redujo MMLU en 1,3 puntos porcentuales y produjo una ΔKLD mayor (0,028 frente a 0,019), lo que sugiere que la dirección dirigida es a la vez más eficaz y menos dañina. Tras la fusión se aplicó cuantización con importance matrix (AD-quantization). Las comprobaciones de "thinking-loop" y salidas vacías pasan en W*=2.0.

## Capacidades

- Generacion de texto conversacional en ingles, chino y aleman.
- Recuperacion de informacion en contexto largo: el test de needle (aguja en pajar) pasa 3/3 tras la modificacion.
- Sin rechazos de seguridad: responde a prompts que el modelo base rechazaria (61,7 % de rechazos en base frente a 0,0 % en esta version).
- Sin falsos rechazos: 0,0 % en XSTest (el base tenia 5,2 %), lo que reduce negativos en prompts benignos.
- No hay informacion sobre tool calling, capacidades de agentes, vision, audio ni modo de razonamiento explicito en la documentacion disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: al ser un modelo sin capa de rechazos y con documentacion cuantitativa de la ablacion, sirve como sujeto de estudio para evaluar tecnicas de ablacion, sus efectos en la distribucion de salida (ΔKLD) y sus costes en benchmarks.
- Pruebas de red teaming: equipos de seguridad pueden usarlo para auditar sistemas, generar contenido adversarial en entornos controlados y probar filtros externos sin que el propio modelo interponga rechazos.
- Escritura creativa sin restricciones tematicas: ficcion con contenido sensible (violencia en narrativa, tematicas adultas) donde el modelo base introduciria falsos rechazos; la reduccion de falsos rechazos en XSTest (de 5,2 % a 0,0 %) es directamente util aqui.
- Asistente local y offline en hardware modesto: con 1,1 GB en disco (AD-Q4_K_M) cabe en practicamente cualquier portatil o mini-PC; el equipo detras del modelo lo distribuye a traves de Atomic Chat para ejecucion local y offline.
- Desarrollo y prototipado de aplicaciones LLM en dispositivos edge: su tamano de 1,7 B de parametros permite integrarlo en apps con latencias bajas sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: al incluir dos niveles (AD-Q6_K y AD-Q4_K_M) con metricas de referencia, es util para estudiar el impacto de la cuantizacion con imatrix en modelos pequenos.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo (comparativa base frente a version uncensored):

| Metrica | Base | Uncensored |
|---|---|---|
| Rechazos en prompts daninos | 61,7 % | 0,0 % |
| Falsos rechazos (XSTest) | 5,2 % | 0,0 % |
| MMLU (2000 preguntas) | 41,0 % | 41,0 % (McNemar p=1.0) |
| Needle (contexto largo) | 3/3 | 3/3 |
| ΔKLD vs base (neutral) | — | +0.019 |

No se han publicado resultados de benchmarks estandar adicionales (GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/disco estimado: 1,6 GB (AD-Q6_K, 7,31 bpw) o 1,1 GB (AD-Q4_K_M, 5,20 bpw); con overhead de contexto, cabe en sistemas con 4-8 GB de RAM/VRAM.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060, RTX 4060 o superior) lo ejecuta con holgura. En CPU x86 o Apple Silicon funciona sin problemas dado su tamano.
- Consumer GPU: si, cabe con facilidad en cualquier GPU consumer actual, incluso en las de gama de entrada con 4 GB de VRAM.
- Despliegue: llama.cpp (requiere un build con soporte LFM3, fusionado en el PR #31252 de llama.cpp; cuantos producidos en el commit `19cce69`). Ejemplo: `llama-cli -hf AtomicChat/LFM3-1.7B-Uncensored-GGUF:AD-Q4_K_M -p "Hello"`. Por extension, cualquier runtime basado en llama.cpp (Ollama, LM Studio) deberia funcionar con dicho soporte; no hay informacion sobre vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles; por tamano (1,7 B) se espera inferencia rapida en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Centerjon/LFM3-1.7B-Uncensored-GGUF | 1,73 B | no disponible | AD-Q6_K, AD-Q4_K_M | LFM Open License v1.0 | Ablacion de seguridad documentada con metricas |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | safetensors (fp) | LFM Open License v1.0 | Modelo original con rechazos (61,7 %) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32k (según ficha oficial) | GGUF comunitario | Apache 2.0 / Qwen | Sin ablacion; ecosistema mas maduro |

Nota: la comparativa se limita a alternativas de tamano similar; no hay datos de rendimiento cruzados publicados para estas tres opciones en la informacion disponible.

## Limitaciones y advertencias

- Eliminacion deliberada de salvaguardas: el modelo responde a prompts daninos sin rechazarlos (0,0 % de rechazos). Su uso para generar contenido ilegal, danino o abusivo puede tener consecuencias legales y eticas graves. El propio autor indica "use responsibly".
- Riesgo de alucinacion: no evaluado especificamente en la model card; al ser un modelo de 1,7 B, la tasa de alucinacion y errores factuales es presumiblemente alta. No usar como fuente de verdad sin verificacion.
- Idiomas: solo se declaran ingles, chino y aleman. El espanol no esta soportado oficialmente; la calidad en castellano no esta garantizada ni evaluada.
- Rendimiento academico modesto: MMLU de 41,0 % lo situa muy por debajo de modelos de 7 B o mas; no es adecuado para tareas de razonamiento complejo o codigo exigente.
- Contexto: la longitud de ventana no esta documentada en la ficha; verificar en la documentacion del modelo base antes de disenar aplicaciones con documentos largos.
- Licencia: LFM Open License v1.0, no es una licencia estandar (Apache/MIT); revisar sus terminos antes de cualquier uso comercial. La ablacion de salvaguardas puede ademas entrar en conflicto con las condiciones de uso del modelo base.
- Dependencia de version de llama.cpp: requiere un build con soporte LFM3 (PR #31252); versiones antiguas de llama.cpp, Ollama o LM Studio no cargaran estos ficheros.
- Procedencia comunitaria: se trata de una derivacion de terceros (216 descargas en el momento de la ficha), sin auditoria independiente de la ablacion ni de la ausencia de efectos secundarios mas alla de las metricas publicadas por el autor.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/Centerjon/LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- PR de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Atomic Chat (proyecto del equipo cuantizador): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
