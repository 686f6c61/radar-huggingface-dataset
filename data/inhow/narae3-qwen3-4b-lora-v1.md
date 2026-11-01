# inhow/Narae3-Qwen3-4B-LoRA-v1

## Resumen

Narae3-Qwen3-4B-LoRA-v1 es un adaptador LoRA experimental publicado por el usuario inhow sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Se distribuye como un par de ficheros GGUF: un base upstream (base.gguf, aproximadamente 2,5 GB) y un adaptador LoRA entrenado con pesos reales (adapter.gguf, unos 11 MB). No se trata de un perfil de prompt ni de una configuración de sistema, sino de un adaptador que debe cargarse junto al base con fuerza 1.

El modelo está orientado a un uso de agente ("Narae agent") dentro de la aplicación Narae Hangul Office, que verifica el SHA256 de los ficheros, el alias del modelo cargado y la presencia efectiva del adaptador LoRA antes de activarlo. La model card es explícita: la ejecución de herramientas, la corrección documental y la finalización autónoma de tareas no están garantizadas.

Por su naturaleza, es un artefacto de nicho con muy poca tracción (128 descargas, 0 likes) y un entrenamiento extremadamente ligero: el manifiesto original registra solo 41 actualizaciones del optimizador. No debe evaluarse como un modelo generalista de producción, sino como un experimento reproducible de adaptación sobre Qwen3-4B-Instruct-2507 con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); adaptador LoRA sobre el modelo base |
| Parametros totales | 2.752.512 (según safetensors del adaptador); el base Qwen3-4B-Instruct-2507 no reporta cifra en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (base.gguf y adapter.gguf); niveles concretos de cuantización no disponibles |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 (con atribución y términos del upstream) |
| Formato de pesos | GGUF (base + adaptador LoRA separados) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3 en su variante Instruct de julio de 2025. El repositorio no documenta la arquitectura interna del base (número de capas, dimensión oculta, cabezas de atención ni mecanismos de atención), por lo que esos detalles deben consultarse en la model card del upstream. El adaptador en sí es un LoRA de bajo rango cuyos pesos suman 2.752.512 parámetros, empaquetado en GGUF para su carga conjunta con el base.

El entrenamiento fue muy breve: el manifiesto original registra 41 actualizaciones del optimizador, lo que sugiere un ajuste ligero y posiblemente de estilo o formato más que una adaptación profunda de capacidades. No se publica información sobre el dataset de entrenamiento, su composición, el número de tokens vistos, ni si hubo RLHF, DPO u otras fases de alineación posteriores. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, modo thinking explícito, etc.) más allá de las que herede del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen3-4B-Instruct-2507.
- Soporte de coreano e inglés, según los metadatos de idioma del repositorio.
- Integración como adaptador LoRA cargable en GGUF junto al base, con fuerza 1.
- Verificación de integridad mediante SHA256 y comprobación del alias del modelo y del adaptador cargado en la aplicación Narae Hangul Office.
- Capacidades de agente declaradas a nivel de propósito del proyecto, pero sin garantía de ejecución de herramientas, corrección documental ni finalización autónoma.
- No se documentan capacidades de visión, audio, tool calling estructurado ni modo thinking específicas del adaptador.

## Casos de uso

- Evaluación de adaptadores LoRA en GGUF: sirve como ejemplo reproducible de cómo empaquetar un adaptador entrenado y cargarlo junto a un base cuantizado, útil para desarrolladores que quieran replicar el flujo con sus propios datos.
- Procesamiento de texto en coreano e inglés: el adaptador puede emplearse en tareas de generación y reescritura bilingüe dentro de la aplicación Narae Hangul Office, su entorno previsto.
- Experimentación académica sobre ajuste ligero: con solo 41 actualizaciones del optimizador, es un caso de estudio sobre qué se puede conseguir con un presupuesto de entrenamiento mínimo.
- Integración en aplicaciones de escritorio con verificación de artefactos: el esquema de SHA256 y comprobación de alias es reutilizable en pipelines que necesiten garantizar la integridad de modelos y adaptadores antes de cargarlos.
- Pruebas de compatibilidad de runtimes GGUF: permite validar si un runtime concreto soporta la carga simultánea de base y adaptador LoRA con fuerza 1.
- Prototipado interno de asistentes documentales: como base para experimentar con flujos de asistencia en documentos, asumiendo que la corrección del resultado no está garantizada y requiere validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio solo indica el tamaño de los ficheros (base.gguf de 2.497.280.736 bytes y adapter.gguf de 11.016.384 bytes), sin especificar el nivel de cuantización, por lo que la VRAM depende del GGUF concreto y del runtime.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del tamaño efectivo del base cuantizado y del soporte de LoRA GGUF en el runtime elegido.
- Opciones de despliegue: la model card menciona explícitamente la aplicación Narae Hangul Office con sus ajustes de modelo; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Narae3-Qwen3-4B-LoRA-v1 | 2.752.512 (adaptador); base no especificado | No disponible | Apache-2.0 | GGUF (base + LoRA) | Experimental, 41 updates, coreano e inglés |
| Qwen/Qwen3-4B-Instruct-2507 | No disponible en la información | No disponible | Apache-2.0 | Safetensors y GGUF (upstream) | Modelo base generalista de la familia Qwen3 |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Entrenamiento extremadamente corto (41 actualizaciones del optimizador): el adaptador puede tener un efecto limitado o sesgado sobre el comportamiento del base.
- La model card advierte explícitamente de que la ejecución de herramientas, la corrección documental y la finalización autónoma no están garantizadas.
- No se documenta el dataset de entrenamiento, por lo que no es posible evaluar sesgos, contaminación ni cobertura lingüística real.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está validado.
- Riesgo de alucinación inherente al modelo base, sin mitigaciones documentadas en el adaptador.
- Longitud de contexto no especificada: no debe asumirse la ventana del base sin verificarla en el upstream.
- Uso comercial permitido por Apache-2.0, pero con obligación de mantener los términos y la atribución del upstream Qwen.
- Requiere cargar base y adaptador juntos con fuerza 1; un uso incorrecto (solo el adaptador o solo el base) invalida el resultado esperado.
- Tracción muy baja (128 descargas, 0 likes) y publicación reciente: no hay evidencia comunitaria de robustez en producción.
- No se incluyen credenciales, documentos de usuario ni conversaciones en el repositorio, pero tampoco garantías de privacidad más allá de lo que imponga la aplicación anfitriona.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inhow/Narae3-Qwen3-4B-LoRA-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
