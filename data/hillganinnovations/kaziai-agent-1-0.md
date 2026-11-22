# hillganinnovations/KaziAI-Agent-1.0

## Resumen

KaziAI-Agent-1.0 es un modelo de lenguaje de 1.777 millones de parámetros (1,78 B) desarrollado por Hillgan Innovations, con sede en Nairobi (Kenia), y publicado bajo licencia MIT. Se trata de un ajuste fino del modelo destilado deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, orientado específicamente a la ejecución de tareas de negocio autónomas: llamadas a herramientas, mutaciones de API estructuradas, mantenimiento de estado transaccional multi-turno, control de acceso basado en roles (RBAC) y cálculo fiscal localizado. El autor lo posiciona como un motor de agente empresarial más que como un chatbot de propósito general.

El modelo parte de la arquitectura Qwen2 del destilado de DeepSeek-R1 y se ha adaptado mediante LoRA/PEFT sobre un conjunto declarado de 8.000 trayectorias empresariales multi-turno. El checkpoint publicado es la versión fusionada (merged) en bfloat16, por lo que no requiere dependencias de PEFT en inferencia, y se distribuye junto con pesos GGUF en Q8_0 y BF16 para despliegue en llama.cpp y Ollama. Su interés actual reside en su huella de memoria reducida (unos 2,1 GB de RAM activa en Q8_0 con caché KV de 4K) y en su enfoque bilingüe inglés-swahili, poco habitual en el ecosistema open source.

La relevancia del modelo es doble: por un lado, demuestra que un modelo de menos de 2 B de parámetros puede especializarse en function calling con resultados declarados competitivos en BFCL; por otro, cubre un nicho geográfico y lingüístico (África Oriental, con soporte declarado de inglés, swahili y sheng) que los grandes laboratorios apenas atienden. No obstante, todos los benchmarks proceden del propio autor y están marcados como no verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino del destilado DeepSeek-R1-Distill-Qwen-1.5B |
| Parámetros totales | 1.777.088.000 (1,78 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona caché KV de 4K en las pruebas de huella de memoria) |
| Tipos de cuantización | BF16 (safetensors y GGUF), Q8_0 (GGUF) |
| Idiomas soportados | inglés (en), swahili (sw); se menciona sheng en las etiquetas |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (Q8_0 y BF16), adaptadores LoRA/PEFT |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Tamaño del repositorio | 9,6 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2 presente en DeepSeek-R1-Distill-Qwen-1.5B, con 1,78 B de parámetros en bfloat16. Sobre esa base, el autor aplicó un ajuste fino supervisado con LoRA/PEFT sobre un corpus declarado de 8.000 trayectorias empresariales multi-turno, que según la model card cubren dominios como CRM y ticketing (KaziDesk), punto de venta e inventario (KaziPOS), administración clínica (Kazi Afya) y contabilidad fiscal. El checkpoint publicado es la fusión de los adaptadores con el modelo base, de modo que la inferencia no necesita PEFT.

La model card describe el enfoque como "neuro-simbólico", combinando el razonamiento encadenado (chain-of-thought) inducido por el destilado de R1 con capas de validación estructurada para la selección de herramientas, la planificación en DAG y el cumplimiento de aprobaciones. No se especifican el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones de decodificación como decodificación especulativa o atención lineal. Toda la información de entrenamiento procede de la propia model card y no es verificable de forma independiente.

## Capacidades

- Generación de texto y razonamiento encadenado, heredado del destilado de DeepSeek-R1.
- Function calling y tool calling: selección de funciones, construcción de argumentos y llamadas múltiples en una misma interacción.
- Planificación multi-paso con representación en DAG para flujos de trabajo empresariales.
- Mantenimiento de estado transaccional a lo largo de conversaciones multi-turno.
- Control de acceso basado en roles (RBAC) y flujos de aprobación con cumplimiento declarado del 98,9 % en el benchmark propio.
- Cálculo fiscal y contable localizado (declarado para el contexto keniano y de África Oriental).
- Capacidades multilingües en inglés y swahili, con menciones a sheng en las etiquetas del repositorio.
- Modo de razonamiento tipo thinking, heredado de la destilación de R1.
- Negativa ante ataques adversariales y contención zero-trust (según la batería de red-team del autor).

## Casos de uso

- Atención al cliente automatizada en mesa de ayuda: el modelo puede gestionar conversaciones multi-turno, clasificar tickets y ejecutar mutaciones en el CRM (KaziDesk) manteniendo el estado de la incidencia, gracias a su entrenamiento específico en trayectorias de ticketing.
- Automatización de punto de venta e inventario: integrado mediante tool calling, puede consultar stock, registrar ventas y generar ajustes de inventario en un ERP, un escenario para el que el autor declara un 98,4 % de éxito en su benchmark KaziPOS.
- Gestión financiera y fiscal: cálculo de impuestos locales, conciliación de libros y generación de asientos contables, con una precisión declarada del 99,2 % en ledger fiscal; adecuado para pymes de África Oriental que operan en swahili e inglés.
- Administración clínica: registro de pacientes, programación de citas y gestión de historiales en entornos sanitarios de recursos limitados, donde el modelo cabe en hardware modesto (unos 2,1 GB de RAM en Q8_0).
- Agentes autónomos de back-office con aprobaciones humanas: la planificación en DAG y el cumplimiento RBAC permiten encadenar pasos con puntos de control antes de ejecutar acciones sensibles, como pagos o cancelaciones.
- Despliegue en el borde (edge): gracias a su tamaño y a la cuantización Q8_0 (1,89 GB en disco), puede ejecutarse en dispositivos con poca memoria o en oficinas sin infraestructura GPU dedicada mediante llama.cpp u Ollama.
- Asistente bilingüe para comercio transfronterizo: conversaciones y documentos en inglés y swahili para operaciones comerciales en Kenia y el este de África, un nicho escasamente cubierto por modelos generalistas.

## Benchmarks y rendimiento

Todos los resultados proceden de la model card del autor y están marcados como no verificados (`verified: false`).

| Benchmark | Métrica | Valor |
|---|---|---|
| BFCL (Berkeley Function-Calling Benchmark) | Overall AST Match Rate | 94,11 % |
| BFCL | Simple AST Accuracy | 96,25 % |
| BFCL | Multiple Function Calling | 94,75 % |
| KaziAI Business Operations Benchmark (Track B) | End-to-End Task Completion (N=2.500) | 98,44 % |
| Track B | CRM & Ticketing (KaziDesk) | 98,80 % |
| Track B | Point-of-Sale & Inventory (KaziPOS) | 98,40 % |
| Track B | Clinical & Health Admin (Kazi Afya) | 97,80 % |
| Track B | Financial & Tax Ledger Precision | 99,20 % |
| KaziBench-500 (held-out) | Intent Accuracy | 97,40 % |
| KaziBench-500 | Tool Selection Accuracy | 96,80 % |
| KaziBench-500 | Argument Accuracy | 94,20 % |
| KaziBench-500 | DAG Planning Accuracy | 92,50 % |
| KaziBench-500 | Safety & Approval Compliance | 98,90 % |
| Red-Team Adversarial Battery (Track C) | Defense-in-Depth Containment (N=1.500) | 99,73 % |
| Track C | Standalone Model Refusal Rate | 96,80 % |

No se han publicado resultados de benchmarks estándar independientes (MMLU, HumanEval, GSM8K) en la información disponible. Los benchmarks KaziBench, Track B y Track C son suites propias del autor, por lo que no son directamente comparables con evaluaciones de terceros.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2,1 GB de RAM activa con la cuantización Q8_0 y caché KV de 4K; aproximadamente 3,3 GB para el checkpoint BF16 en safetensors y 3,55 GB para el GGUF BF16.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar la versión Q8_0; para BF16 se recomienda al menos 6-8 GB (RTX 3060, RTX 4060, RTX 4090). En entornos de servidor, A100 o H100 no son necesarias por tamaño, pero permiten mayor throughput en batching.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con la cuantización Q8_0, y también en CPU y Apple Silicon (Metal) mediante GGUF.
- Opciones de despliegue: transformers, vLLM, TensorRT-LLM, llama.cpp, Ollama y text-generation-inference (etiqueta del repositorio). El autor indica compatibilidad nativa con todas ellas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| KaziAI-Agent-1.0 | 1,78 B | no disponible | MIT | Agente empresarial, function calling, inglés/swahili | Hugging Face (safetensors, GGUF, LoRA) |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 tokens (según el modelo base) | MIT | Razonamiento general destilado | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | Instrucciones generales, multilingüe | Hugging Face |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales | Hugging Face |

La comparación directa de rendimiento no es posible con los datos disponibles: KaziAI solo publica resultados en benchmarks propios y en BFCL, mientras que los modelos alternativos no tienen cifras equivalentes en esta ficha. La ventaja diferencial de KaziAI es la especialización en flujos empresariales y el soporte de swahili; su desventaja es la ausencia de validación independiente y un contexto máximo no documentado.

## Limitaciones y advertencias

- Todos los benchmarks son declarados por el autor y no están verificados de forma independiente; los resultados en suites propias (KaziBench, Track B, Track C) no son comparables con evaluaciones estándar.
- Riesgo de alucinación inherente a un modelo de 1,78 B: la precisión en cálculos fiscales o contables debe validarse con reglas deterministas antes de ejecutar mutaciones reales.
- La longitud de contexto no está documentada; la model card solo menciona pruebas con caché KV de 4K, por lo que no se debe asumir una ventana mayor sin verificación.
- Cobertura lingüística limitada a inglés y swahili (con sheng mencionado solo en etiquetas); el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- El ajuste fino sobre dominios muy específicos (CRM, POS, salud, fiscalidad keniana) puede degradar el rendimiento en tareas generales respecto al modelo base.
- Aunque la licencia es MIT y permite uso comercial, el modelo base y los datos de entrenamiento pueden estar sujetos a condiciones adicionales; conviene revisar la licencia del destilado de DeepSeek-R1 y la procedencia del corpus de trayectorias.
- El repositorio ocupa 9,6 GB y contiene múltiples artefactos; verificar la integridad de los GGUF antes de desplegarlos en producción.
- No hay evidencia publicada de auditorías de sesgo; en un contexto empresarial africano, los sesgos en datos fiscales o clínicos podrían afectar a decisiones automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hillganinnovations/KaziAI-Agent-1.0
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Informe BFCL: https://huggingface.co/hillganinnovations/KaziAI-Agent-1.0/blob/main/evaluations/BFCL_LEADERBOARD.md
- Informe de fiabilidad del agente de negocio: https://huggingface.co/hillganinnovations/KaziAI-Agent-1.0/blob/main/evaluations/BUSINESS_AGENT_RELIABILITY_REPORT.md
- Registro unificado de benchmarks: https://huggingface.co/hillganinnovations/KaziAI-Agent-1.0/blob/main/evaluations/UNIFIED_BENCHMARK_REGISTRY.json
- Informe de validación de seguridad: https://huggingface.co/hillganinnovations/KaziAI-Agent-1.0/blob/main/evaluations/SECURITY_VALIDATION_REPORT.md
- Sitio del desarrollador: https://hillgan.com
- Licencia MIT: https://opensource.org/licenses/MIT
