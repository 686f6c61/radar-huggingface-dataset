# BRR1154/SLM-BrowserAgent-v2

## Resumen

SLM-BrowserAgent-v2 es un modelo de lenguaje de pequeno tamano (494 millones de parametros) especializado en la extraccion autonoma de expresiones XPath sobre el DOM de paginas web y en la navegacion web automatizada. Lo desarrolla Bhavanam Rajendra Reddy (Runtime-Slayers) y parte del checkpoint base Qwen2.5-0.5B-Instruct, afinado previamente en la version v1 del mismo proyecto. Su proposito es servir como motor de decision para agentes de navegador (por ejemplo, sobre Playwright) que necesitan localizar elementos en paginas reales y devolver selectores XPath ejecutables.

La relevancia del modelo reside en su enfoque de entrenamiento: en lugar de un ajuste fino convencional, aplica LoRA real sobre proyecciones concretas y despues consolida los pesos mediante una cirugia de subespacio nulo (null-space consolidation), de modo que el cambio de pesos queda restringido a direcciones ortogonales al subespacio de activaciones del modelo base. Segun el autor, esto permite pasar de un 6,25 % a un 100 % de acierto en la tarea especifica Live-DOM-XPath-16 manteniendo parte de las capacidades generales del modelo original.

Se distribuye con licencia Apache 2.0, en formato safetensors y con pesos en BF16, lo que lo hace desplegable en hardware modesto. Esta pensado exclusivamente para ingles y para un dominio muy acotado, por lo que no debe considerarse un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA y consolidacion en subespacio nulo |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; el autor no la declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 494 millones de parametros, heredado de Qwen2.5-0.5B-Instruct y afinado en dos etapas: primero la version v1 (checkpoint base del proyecto) y despues la v2. El entrenamiento de la v2 se describe como retropropagacion real sobre capas `LoRALinear` (rango 16), con una fase de calibracion de abstenerse ante errores de activacion (`ABSTAIN`) y una consolidacion posterior de pesos mediante SVD de la covarianza de activaciones en subespacio nulo, con la formula `ΔW_proj = ΔW − (ΔW V_base) V_base^T`.

La cirugia de pesos se aplica sobre la banda de capas 10-23, en las proyecciones `q_proj`, `v_proj`, `o_proj` y `down_proj`, con 40 pasos de gradiente y un subespacio SVD empirico de k=24. El autor declara 56/56 modulos mutados y verificados por sha256, un desplazamiento Frobenius maximo del 1,496 % y un error de ortogonalidad en subespacio nulo de 4,233e-09. No se especifica el volumen de tokens de entrenamiento ni la composicion exacta del dataset, aunque la model card menciona suites de evaluacion con verificadores reales (`sqlite3`, `z3`, `lxml.html`, `HTMLParser`, `subprocess` Python y comprobador de DAG de Kahn).

## Capacidades

- Extraccion de XPath sobre DOM en vivo: genera selectores XPath ejecutables para localizar elementos en paginas web reales.
- Navegacion web automatizada: pensado para integrarse en agentes de navegador sobre Playwright y similares.
- Generacion de texto conversacional en formato chat (plantilla de Qwen2.5).
- Razonamiento de dominio acotado: resolucion de tareas especializadas de forma determinista (`do_sample=False` en el ejemplo de uso).
- Calibracion de abstenerse: mecanismo de `ABSTAIN` ante errores de activacion, orientado a evitar respuestas erroneas en tareas fuera de dominio.
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes multi-paso: no documentado de forma explicita; el uso previsto es como componente de decision dentro de un agente externo.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Automatizacion de pruebas end-to-end: el modelo puede generar selectores XPath robustos para localizar elementos en paginas renderizadas, lo que permite mantener suites de Playwright o Selenium cuando cambia el marcado HTML.
- Scraping estructurado: dado un DOM en vivo, devuelve el XPath del elemento objetivo, lo que simplifica la extraccion de datos en pipelines de recoleccion.
- Agentes de navegador autonomos: se usa como modulo de decision para elegir que elemento pulsar o rellenar en cada paso, con salida determinista (`do_sample=False`) que facilita la reproducibilidad.
- Relleno de formularios y flujos de registro: localiza campos de entrada y botones a partir de descripciones en lenguaje natural, reduciendo el mantenimiento de selectores manuales.
- Monitorizacion de cambios en webs: combinado con un agente externo, permite detectar y localizar elementos que cambian de posicion o de atributos entre despliegues.
- Componente ligero en entornos con recursos limitados: con 494 M de parametros y pesos BF16 (repo de 1,0 GB), puede ejecutarse en una sola GPU de consumo o incluso en CPU para tareas de bajo volumen.
- Evaluacion de robustez de agentes: sirve como banco de pruebas para medir la retencion de capacidades generales tras un ajuste fino especializado, gracias a su suite ARC-Easy-25.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Metrica | v1 (baseline) | v2 | Delta |
|---|---|---|---|---|
| Live-DOM-XPath-16 | Domain Execution / Solver Accuracy | 6,25 % | 100,00 % | +93,75 pts |
| ARC-Easy-25 | Raw / Calibrated accuracy | 64,0 % / 72,0 % | 52,0 % / 64,0 % | −12,0 / −8,0 pts |
| AA-Omniscience-12 | Calibration Index | −25,00 | −16,67 | +8,33 pts |

El autor indica que las metricas se midieron sobre suites de test disjuntas con verificadores de ejecucion reales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1 GB para pesos, mas overhead de activaciones y cache KV; cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son validas, aunque el modelo no aprovecha el rendimiento de las de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de consumo; tambien puede ejecutarse en CPU para cargas de baja concurrencia.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-BrowserAgent-v2 | 494 M | no disponible | Agente de navegador / XPath | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 tokens (segun ficha oficial de Qwen) | Modelo generalista de instrucciones | Apache 2.0 | Hugging Face |
| SLM-BrowserAgent-v1 | 494 M | no disponible | Version previa del especialista | Apache 2.0 | Hugging Face |

La comparacion con alternativas especializadas en agentes de navegador de otros autores no esta disponible en la informacion proporcionada. Frente al modelo base Qwen2.5-0.5B-Instruct, la v2 sacrifica retencion general (ARC-Easy-25 baja de 64,0 % a 52,0 % en crudo) a cambio de un salto muy grande en la tarea de dominio.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: su rendimiento sobresaliente se limita a la tarea Live-DOM-XPath-16; no debe emplearse como modelo de proposito general.
- Perdida de capacidades generales: la retencion en ARC-Easy-25 cae 12 puntos porcentuales en crudo respecto a v1, lo que indica olvido catastrofico parcial.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion fuera de dominio: el mecanismo `ABSTAIN` mitiga errores de activacion, pero no garantiza correccion en entradas no vistas.
- Benchmarks no verificados: los resultados del model-index estan marcados como `verified: false` y proceden del propio autor; conviene replicarlos antes de usarlos en produccion.
- Datos de entrenamiento no documentados: no se especifica el volumen ni la composicion del dataset, lo que dificulta evaluar sesgos y cobertura.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda las condiciones del checkpoint base Qwen2.5-0.5B-Instruct; revisar la ficha de Qwen antes de desplegar.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-BrowserAgent-v2
- Checkpoint base v1: https://huggingface.co/BRR1154/SLM-BrowserAgent-v1
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
