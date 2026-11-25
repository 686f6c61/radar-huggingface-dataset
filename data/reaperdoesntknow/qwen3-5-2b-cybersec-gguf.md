# reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF

## Resumen

Qwen3.5-2B-CyberSec-GGUF es la distribucion en formato GGUF del checkpoint Qwen3.5-2B-CyberSec, un ajuste fino del modelo base Qwen3.5-2B (registrado como `unsloth/Qwen3.5-2B`) especializado en dominios de ciberseguridad mediante instruction tuning sobre el dataset Trendyol Cybersecurity Instruction Tuning Dataset. Lo publica el usuario `reaperdoesntknow` como parte de su coleccion CIx de modelos de seguridad, y esta pensado para inferencia local en runtimes compatibles con `llama.cpp` (llama-cli, Ollama, etc.).

El modelo cuenta con 1.942.653.248 parametros totales (aproximadamente 2B) en una arquitectura derivada de la familia Qwen3.5, con licencia Apache-2.0. El repositorio GGUF ocupa 8,0 GB e incluye cuatro artefactos: BF16 (3,90 GB), Q8_0 (2,08 GB), Q4_K_M (1,31 GB) y un proyector multimodal BF16 (`BF16-mmproj.gguf`) cuya funcionalidad no esta verificada segun la propia model card.

Su relevancia practica es acotada pero concreta: ofrece un checkpoint pequeno, cuantizado y ejecutable en CPU o GPU de consumo para experimentacion cualitativa en tareas de seguridad (analisis de configuraciones, explicacion de vulnerabilidades, generacion de comandos de diagnostico). No se publican resultados de benchmarks ni evaluaciones de seguridad con esta release, por lo que debe tratarse como material de evaluacion y no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (detalles especificos no disponibles) |
| Parametros totales | 1.942.653.248 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF); proyector BF16-mmproj |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint fuente) |

## Arquitectura y entrenamiento

El checkpoint fuente es un ajuste fino del modelo Qwen3.5-2B, de aproximadamente 1,94 mil millones de parametros. La model card no detalla la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion, uso de GQA, etc.), por lo que esos datos deben considerarse no disponibles. La configuracion del modelo fuente incluye componentes de vision, segun la propia model card, aunque el proyector multimodal incluido en este repo no viene acompanado de ninguna prueba de humo documentada.

El entrenamiento se realizo mediante instruction tuning supervisado sobre el Trendyol Cybersecurity Instruction Tuning Dataset, un conjunto de instrucciones orientado a tareas de seguridad. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores. Tampoco se documenta el proceso de cuantizacion mas alla de los formatos publicados, ni se indica que se haya realizado decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en el dominio de ciberseguridad, segun el ajuste fino declarado.
- Respuesta a instrucciones tecnicas (explicaciones, procedimientos, analisis cualitativo) derivadas del dataset Trendyol.
- Soporte de plantillas de chat mediante `--jinja` en `llama.cpp`, lo que habilita conversaciones multi-turno con el formato de prompt del modelo base.
- Posible capacidad multimodal heredada del modelo fuente (proyector `BF16-mmproj.gguf` incluido), sin verificacion documentada; debe validarse antes de asumirla.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion cualitativa local del checkpoint: ejecutar el modelo con Q4_K_M en una maquina de consumo para comparar la calidad de respuestas frente a BF16 y Q8_0, tal como sugiere el autor en la seccion de uso previsto.
- Asistencia en analisis de configuraciones de seguridad: pedir al modelo que explique el proposito de directivas de firewall, politicas de IAM o parametros de hardening, usando la ventana de contexto disponible (no documentada) para incluir fragmentos de configuracion.
- Generacion de comandos de diagnostico en entornos aislados: producir comandos de reconocimiento o verificacion (por ejemplo, comprobaciones de permisos o de exposicion de puertos) que un analista revisa antes de ejecutar, dado el aviso explicito del autor de no ejecutar salidas sin revision.
- Formacion y documentacion interna: redactar borradores de guias o notas explicativas sobre conceptos de seguridad a partir de instrucciones, con revision humana obligatoria por el riesgo de alucinacion.
- Prototipado de chatbots de soporte tecnico especializado: integrar el GGUF en Ollama o `llama.cpp` para validar flujos conversacionales multi-turno antes de invertir en un modelo mayor.
- Comparacion de calidad entre cuantizaciones en pipelines de CI: automatizar pruebas de regresion cualitativa entre BF16, Q8_0 y Q4_K_M para decidir que variante desplegar en un entorno de bajo recursos.
- Experimentacion en CPU: el build Q4_K_M de 1,31 GB permite pruebas en portatiles sin GPU, util para prototipos y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta release no incluye informes de benchmark, regresion ni evaluacion de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada archivo GGUF y el overhead del runtime):
  - Q4_K_M (1,31 GB): en torno a 2-3 GB de memoria total, apto para CPU.
  - Q8_0 (2,08 GB): en torno a 3-4 GB de memoria total.
  - BF16 (3,90 GB): en torno a 5-6 GB de memoria total.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para BF16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090); para Q4_K_M basta una GPU integrada o incluso CPU.
- Cabe en GPU de consumo: si, en toda la gama RTX 30/40 y equivalentes con 6 GB o mas para BF16; Q4_K_M y Q8_0 caben en GPUs de 4 GB.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/...`), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-CyberSec-GGUF | ~1,94B | no disponible | Apache-2.0 | GGUF | Ajuste fino en ciberseguridad, sin benchmarks publicados |
| Qwen3.5-2B (base, `unsloth/Qwen3.5-2B`) | ~1,94B | no disponible | no disponible en la informacion | safetensors | Modelo base sin ajuste de dominio |
| Alternativas de ~2B especializadas en seguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria; los datos de benchmarks de este modelo y de sus competidores no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks, informes de regresion y evaluaciones de seguridad en la release; no hay evidencia cuantitativa de calidad.
- La cuantizacion puede alterar el comportamiento respecto al checkpoint fuente; el autor lo advierte explicitamente.
- Riesgo de alucinacion alto en un dominio donde los errores tienen consecuencias operativas: comandos incorrectos, directivas inseguras o procedimientos obsoletos.
- Las instrucciones de seguridad generadas pueden ser erroneas, inseguras o de doble uso; no deben ejecutarse sin revision y aislamiento.
- No debe usarse como control de seguridad autoritativo ni como tomador de decisiones.
- La capacidad multimodal no esta verificada: el proyector esta presente pero no hay prueba documentada del formato de prompt, version de runtime ni ruta de imagen.
- Idiomas soportados no declarados; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no documentada, lo que limita la planificacion de casos de uso con documentos largos.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluacion de seguridad traslada al integrador toda la responsabilidad sobre el comportamiento del modelo.
- El modelo base registrado es `unsloth/Qwen3.5-2B`; conviene verificar la cadena de linaje y los terminos del checkpoint fuente antes de un despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Checkpoint fuente: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Modelo base registrado: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de instruction tuning: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx de modelos de ciberseguridad: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
