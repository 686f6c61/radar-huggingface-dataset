# enne2-or-more/IMMA-1.7B-IT-Tech-GGUF

## Resumen

IMMA-1.7B-IT-Tech-GGUF es la distribución en formato GGUF de IMMA, un ajuste fino del modelo LiquidAI/LFM3-1.7B orientado a la comunicación técnica y empresarial en italiano. Lo desarrolla Matteo Benedetto (usuario enne2-or-more) como experimento didáctico, según declara el propio autor, y se publica bajo la licencia lfm-open-license-1.0. El modelo está pensado para redactar textos formales en italiano con terminología técnica precisa, formatos numéricos italianos y un registro profesional, tareas en las que los modelos pequeños genéricos suelen fallar por contaminación del inglés.

El repositorio contiene dos cuantizaciones listas para llama.cpp: Q8_0 (1,85 GB), que el autor recomienda por su calidad prácticamente equivalente al adaptador en bf16, y Q4_K_M (1,10 GB), una alternativa ligera que pierde algunos puntos en el cumplimiento de restricciones de formato. El modelo base tiene 1.728.801.600 parámetros y el ajuste se realizó mediante un adaptador DoRA publicado por separado en enne2-or-more/IMMA-1.7B-IT-Tech, donde se documentan la metodología y las métricas completas.

La relevancia de esta ficha es doble: por un lado, muestra un caso de especialización lingüística de bajo coste sobre un modelo compacto; por otro, documenta un comportamiento problemático del modo de razonamiento del modelo base, que razona en inglés y consume el presupuesto de tokens sin emitir respuesta si no se desactiva o se amplía el límite. No hay datos de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8192 tokens (configuración de ejemplo del autor con `-c 8192`; no se especifica el máximo del modelo base) |
| Tipos de cuantización | Q8_0 (1,85 GB) y Q4_K_M (1,10 GB) |
| Idiomas soportados | italiano (`it`) |
| Licencia | lfm-open-license-1.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LiquidAI/LFM3-1.7B; esta ficha no puede confirmar si se trata de un transformer convencional, un modelo híbrido o una arquitectura con atención lineal. Lo que sí consta es el procedimiento de ajuste: se parte de LFM3-1.7B y se aplica un adaptador DoRA (variante de LoRA con descomposición de magnitud y dirección) entrenado para comunicación técnica y empresarial en italiano, publicado en el repositorio enne2-or-more/IMMA-1.7B-IT-Tech. La model card de esta distribución GGUF remite explícitamente a ese repositorio para los números, la metodología y los detalles del dataset de entrenamiento, que no se reproducen aquí.

El autor describe el trabajo como un experimento didáctico realizado en un día, lo que implica un volumen de datos y una validación limitados. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación práctica del artefacto no está en el entrenamiento sino en la distribución: cuantizaciones verificadas para llama.cpp con instrucciones de despliegue concretas, incluida la advertencia de que se requiere llama.cpp ≥ b12212 porque compilaciones anteriores fallan con algunos cuantizados de esta generación de modelos.

## Capacidades

- Generación de texto formal en italiano con registro profesional y terminología técnica precisa.
- Redacción de comunicación empresarial: correos, informes, actas, respuestas a licitaciones y documentación interna.
- Aplicación de convenciones numéricas italianas (1.234,56 y 12,5 %), un detalle que los modelos multilingües genéricos suelen incumplir.
- Conversación multi-turno (etiqueta `conversational` en el repositorio) dentro de la ventana configurada.
- Cumplimiento de restricciones de formato: el autor señala que Q4_K_M pierde algunos puntos frente a Q8_0 en este aspecto, lo que implica que Q8_0 sí las respeta de forma fiable.
- Modo de razonamiento disponible en el modelo base, pero desaconsejado por el autor: con `enable_thinking` activo el modelo razona en inglés y consume el presupuesto de tokens sin producir la respuesta salvo que se asignen al menos 2000 tokens.
- No consta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información proporcionada.
- Capacidad multilingüe limitada al italiano según la model card; no se documenta un rendimiento fiable en otros idiomas.

## Casos de uso

- Redacción de correos empresariales en italiano: el modelo genera mensajes formales con el registro y la terminología adecuados, y el system prompt recomendado fija las convenciones numéricas italianas para evitar el formato anglosajón.
- Generación de documentación técnica interna: descripciones de procedimientos, fichas de producto y notas de release en italiano formal, con la ventaja de que el ajuste prioriza precisión terminológica sobre creatividad.
- Respuestas a formularios y modulística administrativa: el nombre del modelo alude explícitamente a la modulística aziendale, y el ajuste está orientado a rellenar y redactar este tipo de documentos con formato consistente.
- Asistencia en atención al cliente en italiano: con temperatura 0,1 y decodificación determinista, el modelo produce respuestas estables y repetibles para plantillas de respuesta y clasificación de consultas dentro de la ventana de 8192 tokens.
- Preprocesado y normalización de texto italiano: conversión de cifras y porcentajes al formato local, corrección de registro y homogeneización de estilo en lotes de documentos.
- Despliegue en hardware modesto o en el borde: con 1,10 GB en Q4_K_M y 1,85 GB en Q8_0, el modelo cabe en GPU de consumo y en CPU, lo que permite ejecutarlo en portátiles o en servidores sin acelerador para tareas de redacción por lotes.
- Prototipado y docencia: al ser un experimento didáctico con adaptador DoRA publicado, sirve como referencia para replicar un ajuste lingüístico de bajo coste sobre un modelo de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio del adaptador (enne2-or-more/IMMA-1.7B-IT-Tech) para las métricas, que no se incluyen en los datos proporcionados. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M y 1,85 GB con Q8_0 para los pesos; hay que sumar la caché KV, configurable en el ejemplo del autor con `--cache-type-k q8_0 --cache-type-v q8_0` para reducirla.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar Q8_0 con contexto de 8192 tokens y caché cuantizada; una RTX 4090, A100 o H100 no aportan ventaja significativa por el tamaño del modelo, salvo por mayor paralelismo de peticiones.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y baja con 4-6 GB de VRAM; también es viable en CPU pura, dado el tamaño reducido de los pesos.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con el comando documentado por el autor (`llama-server -hf enne2-or-more/IMMA-1.7B-IT-Tech-GGUF:Q8_0 --jinja -c 8192 -ngl 999 -fa on --cache-type-k q8_0 --cache-type-v q8_0 --temp 0.1 --top-k 50 --repeat-penalty 1.1`). El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI. No se documentan otras integraciones como Ollama o vLLM.
- Requisito de runtime: llama.cpp ≥ b12212; las compilaciones anteriores fallan con algunos cuantizados de esta generación de modelos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| IMMA-1.7B-IT-Tech-GGUF | 1,73B | 8192 (config. documentada) | italiano | lfm-open-license-1.0 | GGUF | Ajuste DoRA sobre LFM3-1.7B; experimento didáctico |
| LiquidAI/LFM3-1.7B (base) | 1,73B | no disponible | multilingüe (no detallado) | lfm-open-license-1.0 | safetensors, GGUF | Modelo base sin especialización; referencia directa |
| IMMA-1.7B-IT-Tech (adaptador) | 1,73B (base + DoRA) | no disponible | italiano | no disponible en los datos | safetensors (adaptador) | Misma especialización en bf16; fuente de la metodología y métricas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El autor califica el modelo como experimento didáctico hecho en un día y "seguramente mejorable"; no debe tratarse como un producto validado para producción.
- El modo de razonamiento del modelo base está activo por defecto en algunos flujos: si no se pasa `chat_template_kwargs={"enable_thinking": false}`, el modelo razona en inglés y consume el presupuesto de tokens sin emitir la respuesta, salvo que se asignen al menos 2000 tokens.
- La cuantización Q4_K_M pierde precisión en el cumplimiento de restricciones de formato respecto a Q8_0; para tareas con formato estricto debe usarse Q8_0.
- El modelo solo está documentado para italiano; no hay evidencia de calidad en otros idiomas y la etiqueta de idioma del repositorio es únicamente `it`.
- Riesgo de alucinación inherente a un modelo de 1,7B: no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia lfm-open-license-1.0: es una licencia "other" con condiciones específicas definidas por LiquidAI; antes de un uso comercial hay que revisar el texto enlazado en la model card, ya que puede imponer restricciones de escala o de atribución.
- Dependencia estricta de llama.cpp ≥ b12212; compilaciones anteriores fallan con estos cuantizados.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/enne2-or-more/IMMA-1.7B-IT-Tech-GGUF
- Adaptador DoRA y model card completa: https://huggingface.co/enne2-or-more/IMMA-1.7B-IT-Tech
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Texto de la licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/enne2-or-more
