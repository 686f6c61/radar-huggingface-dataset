# flyingfishinwater/good_and_small_models

## Resumen

`flyingfishinwater/good_and_small_models` no es un modelo único, sino un repositorio agregador publicado por el usuario flyingfishinwater que reúne varias compilaciones en formato GGUF de modelos pequeños (en torno a 4B parámetros) pensados para ejecución en dispositivos móviles y entornos con recursos limitados. El repositorio actúa como catálogo de distribuciones cuantizadas de terceros: Qwen3-4B-Instruct-2507, Qwen3-4B-Thinking-2507 y GLM-Edge-4B-Chat, entre otros, empaquetados para su uso en la aplicación Privacy AI (iOS), que ejecuta la inferencia de forma local y sin servidor.

La relevancia del repositorio radica en su enfoque práctico: ofrece artefactos Q4 listos para descargar (entre 2,1 y 2,6 GB por modelo) que caben en la memoria de un teléfono moderno y permiten conversación, razonamiento y uso de herramientas sin enviar datos a la nube. No obstante, conviene subrayar que el autor no entrena ni modifica los pesos originales: se limita a cuantizar y redistribuir modelos de Qwen (Alibaba) y Zhipu AI (THUDM), por lo que las capacidades reales son las de los modelos de origen.

El dato de parámetros totales registrado en safetensors para el repositorio (360.748.032) no corresponde a ninguno de los modelos descritos en la model card, que son de aproximadamente 4B parámetros; probablemente refleje un artefacto auxiliar (tokenizador, cabecera o modelo pequeño adicional). El tamaño total del repositorio es de 320,3 GB, coherente con un catálogo que acumula múltiples cuantizaciones y versiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos de origen Qwen3 y GLM-Edge); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | Aproximadamente 4B por modelo incluido; el campo safetensors del repo indica 360.748.032 (no representativo de los modelos de la card) |
| Parámetros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | 262.000 tokens en los modelos Qwen3 de origen; la card indica 2048 tokens para Qwen3 y 1024 para GLM-Edge en la configuración de la app; GLM-4 de origen soporta hasta 128K |
| Tipos de cuantización | Q4_0 (Qwen3-4B-Instruct-2507 y Qwen3-4B-Thinking-2507), Q4_K_M (GLM-Edge-4B-Chat); el repo incluye además ONNX, GGUF e imatrix |
| Idiomas soportados | No disponible a nivel de repositorio; los modelos de origen Qwen3 son multilingües y GLM-4 declara 26 idiomas (japonés, coreano, alemán, entre otros) |
| Licencia | No disponible para el repositorio; los modelos de origen Qwen3 se distribuyen bajo Apache 2.0 y GLM-Edge bajo su propia licencia (enlace en la card) |
| Formato de pesos | GGUF y ONNX |

## Arquitectura y entrenamiento

Los modelos empaquetados son transformers decoder-only de aproximadamente 4B parámetros. Qwen3-4B-Instruct-2507 y Qwen3-4B-Thinking-2507 pertenecen a la familia Qwen3 de Alibaba, con mejoras declaradas en razonamiento, matemáticas, ciencia, código y uso de herramientas; la variante Thinking activa el modo de razonamiento por defecto. GLM-Edge-4B-Chat procede de Zhipu AI (THUDM) y añade navegación web, ejecución de código, function calling y razonamiento sobre texto largo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. El repositorio no documenta un proceso de entrenamiento propio: su aportación es la cuantización (Q4_0, Q4_K_M) y el empaquetado para inferencia local en iOS, con plantillas de prompt predefinidas (template `qwen`, BOS activado, EOS desactivado, parseo de tokens especiales).

## Capacidades

- Generación de texto conversacional multi-turno en dispositivos móviles.
- Razonamiento lógico y matemático, con variante Thinking que expone cadena de pensamiento.
- Conocimiento científico y resolución de problemas academicos (según la descripción de los modelos de origen).
- Generación y asistencia de código.
- Uso de herramientas y function calling (declarado en GLM-Edge-4B-Chat y en Qwen3-4B-Instruct-2507).
- Navegación web y ejecución de código (GLM-4 de origen).
- Razonamiento sobre texto largo.
- Soporte multilingüe (26 idiomas en GLM-4 de origen; Qwen3 declara soporte multilingüe fuerte).
- Ejecución totalmente local y sin servidor dentro de la app Privacy AI, con búsqueda web, cotizaciones bursátiles y análisis de salud como herramientas integradas.

## Casos de uso

- Asistente personal offline en iOS: la app Privacy AI carga el GGUF Q4 (2,1-2,6 GB) en el dispositivo y responde consultas sin conexión, adecuado para entornos con requisitos de privacidad estrictos.
- Chatbot de atención al cliente en el borde: desplegando el GGUF con llama.cpp en una pasarela local, el modelo gestiona conversaciones multi-turno sin exponer datos a terceros.
- Asistencia de código en el editor: Qwen3-4B-Instruct-2507 puede integrarse mediante un servidor compatible con OpenAI (endpoints_compatible) para autocompletado y explicación de fragmentos.
- Razonamiento matemático asistido: la variante Thinking, con su cadena de pensamiento, sirve para resolver problemas paso a paso en herramientas educativas.
- Análisis de documentos largos: aunque la app limita el contexto a 2048 tokens, el modelo de origen soporta 262K, por lo que con un runtime adecuado (llama.cpp con contexto extendido) se pueden resumir informes extensos.
- Agentes locales con tool calling: GLM-Edge-4B-Chat permite encadenar llamadas a funciones (calendario, clima, APIs internas) dentro de un asistente móvil.
- Prototipado rápido en portátiles sin GPU: los GGUF Q4 caben en RAM de 8 GB y permiten validar pipelines de agentes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,5-3,5 GB para Q4_0 y Q4_K_M (tamaños de archivo de 2,1-2,6 GB más overhead de contexto).
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060); también en Apple Silicon unificada y en smartphones de gama alta.
- GPU de datacenter: A100, H100 y L40S pueden servir múltiples instancias en paralelo, aunque el modelo está pensado para el borde.
- Despliegue: llama.cpp, Ollama, servidores compatibles con OpenAI (tag `endpoints_compatible`), ONNX Runtime para el artefacto ONNX; vLLM y TGI no están confirmados para estos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (empaquetado aquí) | ~4B | 262K (origen); 2048 en la app | Apache 2.0 (origen) | GGUF Q4_0 en este repo |
| Qwen3-4B-Thinking-2507 (empaquetado aquí) | ~4B | 262K (origen); 2048 en la app | Apache 2.0 (origen) | GGUF Q4_0 en este repo |
| GLM-Edge-4B-Chat (empaquetado aquí) | ~4B | 128K (origen GLM-4); 1024 en la app | Licencia propia de THUDM | GGUF Q4_K_M en este repo |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | Disponible en GGUF en múltiples repos |

La comparación se limita a los modelos incluidos en el propio repositorio y a un competidor de tamaño similar; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor: los pesos son redistribuciones cuantizadas de Qwen y Zhipu AI, por lo que heredan sus sesgos y limitaciones.
- La licencia del repositorio no está declarada; para uso comercial hay que remitirse a las licencias de los modelos de origen (Apache 2.0 en Qwen3, licencia específica en GLM-Edge).
- La configuración de la app limita el contexto a 2048 tokens (Qwen3) y 1024 tokens (GLM-Edge), muy por debajo de la ventana nativa; el rendimiento en tareas de contexto largo dependerá del runtime utilizado.
- La cuantización Q4 introduce pérdida de precisión frente a los pesos originales, especialmente en matemáticas y código.
- Riesgo de alucinación inherente a modelos de 4B, mayor en dominios especializados.
- El dato de parámetros safetensors (360,7M) no coincide con los modelos de la card; conviene verificar el artefacto antes de desplegarlo.
- El repositorio acumula 320,3 GB y múltiples versiones; la selección del archivo correcto requiere atención.
- No se documentan idiomas soportados a nivel de repositorio ni evaluación de sesgos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/flyingfishinwater/good_and_small_models
- Qwen3-4B-Instruct-2507 (origen): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Qwen3-4B-Thinking-2507 (origen): https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- GLM-Edge (origen, THUDM): https://huggingface.co/THUDM
- Licencia GLM-Edge: https://huggingface.co/THUDM/glm-edge-4b-chat/raw/main/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- App Privacy AI en App Store: https://apps.apple.com/app/apple-store/id6738392421
- Sitio oficial de Privacy AI: https://privacyai.acmeup.com
