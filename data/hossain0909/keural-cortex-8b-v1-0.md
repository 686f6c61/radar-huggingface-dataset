# hossain0909/Keural-Cortex-8B-v1.0

## Resumen

Keural Cortex 8B v1.0 es un modelo de lenguaje de 8.190.735.360 parámetros publicado por el usuario hossain0909 en Hugging Face, presentado como el primer checkpoint público del programa "Keural Cortex" de la organización MKD. Se trata de un transformer decoder-only derivado de Qwen3-8B-Base, afinado para interacción bilingüe coreano-inglés en entornos empresariales y con una capa estructurada de generación de llamadas a herramientas (tool calling) compatible con la API de OpenAI.

El modelo resuelve el problema del despliegue local controlado por el cliente: está pensado para ejecutarse en infraestructura propia mediante un endpoint vLLM compatible con OpenAI, donde la aplicación anfitriona (no el modelo) ejecuta las herramientas, aplica permisos y gestiona los datos. Incorpora 36 capas, hidden size de 4.096, 32 cabezas de atención con 8 cabezas KV (GQA) y un vocabulario de 151.936 tokens, con una longitud máxima de posición configurada en 65.536 tokens.

Es relevante ahora por su enfoque "local-first" y su contrato de herramientas explícito (search_web, fetch_web_urls, retrieve_documents, ask_clarification), así como por su licencia Apache-2.0, que facilita su adopción comercial. No obstante, el modelo tiene un historial de publicación muy reciente y un volumen de descargas mínimo (23), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (longitud máxima de posición configurada) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 SafeTensors) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (BF16, ~16 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 36 capas, hidden size de 4.096, 32 cabezas de atención y 8 cabezas KV (atención con query grouping, GQA), y un vocabulario de 151.936 tokens. El modelo parte de Qwen3-8B-Base, según indica la propia model card en su nota de certificación, y se distribuye en BF16 SafeTensors con un tamaño de repositorio de 16,4 GB.

El proceso de alineamiento descrito incluye entrenamiento continuado, ajuste supervisado de instrucciones (SFT), optimización de preferencias y un ajuste específico sobre contratos de agente y herramientas ("Keural agent/tool-contract tuning"). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni los algoritmos concretos de RLHF/DPO empleados, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional e instruccional en inglés y coreano.
- Generación de llamadas a herramientas estructuradas compatibles con la API de OpenAI (`/v1/chat/completions`), incluyendo `search_web`, `fetch_web_urls`, `retrieve_documents` y `ask_clarification`.
- Comportamiento de agente con separación entre decisión del modelo y ejecución de herramientas por parte de la aplicación.
- Soporte de peticiones de aclaración cuando la instrucción es ambigua (genera pregunta y checklist).
- Modo de recuperación documental con parámetro `exhaustive` para solicitudes de cobertura completa.
- Ventana de contexto larga (65.536 tokens) para conversaciones multi-turno y documentos extensos.
- Compatibilidad con vLLM y con `--tool-call-parser hermes` y `--enable-auto-tool-choice`.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Atención al cliente bilingüe coreano-inglés: el modelo puede mantener conversaciones multi-turno con hasta 65.536 tokens de contexto, lo que permite arrastrar historial e información de cuenta sin truncamientos frecuentes.
- Asistentes empresariales con acceso a herramientas aprobadas: la aplicación define qué herramientas expone y el modelo genera llamadas estructuradas (`search_web`, `retrieve_documents`) que el servidor valida y ejecuta fuera del proceso del modelo.
- Búsqueda documental interna: mediante la herramienta `retrieve_documents` con `file_ids` y `exhaustive: true`, el modelo puede formular consultas de recuperación sobre corpus privados gestionados por la aplicación.
- Flujos de aclaración en formularios o tickets: cuando la petición del usuario es incompleta, el modelo genera `ask_clarification` con pregunta y checklist, útil en sistemas de intake de incidencias.
- Despliegue on-premise en infraestructura controlada: al ejecutarse con vLLM en un endpoint compatible con OpenAI, encaja en arquitecturas donde la retención de datos y las credenciales deben permanecer en el cliente.
- Prototipado de agentes con separación de responsabilidades: útil para equipos que quieren un modelo que proponga acciones pero donde la autorización, auditoría y efectos secundarios los controle la capa de producto.
- Asistentes de documentación técnica en coreano e inglés: generación y resumen de contenido bilingüe en herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta "smoke tests" de serving verificados a través de la API compatible con OpenAI de vLLM (chat coreano simple, generación de `search_web`, generación de `retrieve_documents` con `exhaustive: true` y generación de `ask_clarification`), sin métricas cuantitativas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos, no verificada oficialmente para este checkpoint.
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB para pesos, no verificada oficialmente para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto reducido, y potencialmente en GPUs de 16 GB si se aplica cuantización, aunque no hay artefactos GGUF publicados en el repositorio.
- Opciones de despliegue: vLLM (verificado por el autor, con `--tool-call-parser hermes` y `--enable-auto-tool-choice`); compatible con TGI según los tags; llama.cpp y Ollama no están verificados ni se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tool calling | Disponibilidad |
|---|---|---|---|---|---|---|
| Keural Cortex 8B v1.0 | 8.190.735.360 | 65.536 | en, ko | Apache-2.0 | Sí (formato OpenAI) | Hugging Face, 23 descargas |
| Qwen3-8B-Base (modelo base) | ~8B | no disponible en esta ficha | multilingüe | Apache-2.0 | no disponible | Hugging Face |
| Qwen3-8B (instruct) | ~8B | no disponible en esta ficha | multilingüe | Apache-2.0 | Sí | Hugging Face |
| Llama 3.1 8B Instruct | ~8B | 128.000 | multilingüe | Llama 3.1 Community License | Sí | Hugging Face |

La comparación con Qwen3-8B y Llama 3.1 8B Instruct es pertinente por tamaño y categoría, pero no se dispone de datos de rendimiento del checkpoint Keural Cortex que permitan una comparación cuantitativa; la model card no publica benchmarks. El contexto de 65.536 tokens es inferior al de Llama 3.1 8B (128.000) y el soporte idiomático está limitado a inglés y coreano, frente al carácter multilingüe de los alternativas.

## Limitaciones y advertencias

- La model card advierte de que las salidas pueden ser inexactas, incompletas o inconsistentes entre prompts y configuraciones de serving; hay que verificar la información importante.
- El modelo no tiene acceso inherente a la web en vivo, a documentos privados ni autoridad para ejecutar acciones externas; esas capacidades deben aportarlas y gobernarlas la aplicación anfitriona.
- Las llamadas a herramientas son sugerencias del modelo: deben validarse esquemas, autorización, intención del usuario y efectos secundarios antes de ejecutarlas.
- No debe usarse como única base para decisiones de alto riesgo en ámbitos médico, legal, financiero, de seguridad, empleo, crédito o control de acceso.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3-8B-Base, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinación: reconocido implícitamente por el autor en la sección de uso responsable, aunque sin métricas.
- Limitaciones de idioma: solo inglés y coreano; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben conservarse los avisos de atribución de Qwen3-8B-Base y cumplirse los términos de la licencia upstream.
- Estado de publicación: v1.0 es un checkpoint inicial con 23 descargas y 0 likes; el autor indica que las versiones públicas solo se publican tras validación interna, por lo que conviene evaluar en datos y flujos propios antes de producción.
- El contexto máximo de 65.536 tokens debe ajustarse según la memoria de GPU disponible; no se garantiza el rendimiento a esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-v1.0
- Modelo base referenciado: Qwen3-8B-Base (no se proporciona URL directa en la información disponible)
