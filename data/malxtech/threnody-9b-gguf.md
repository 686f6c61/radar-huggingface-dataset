# MalxTech/Threnody-9B-GGUF

## Resumen

Threnody-9B V2 (GGUF) es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario MalxTech en Hugging Face bajo licencia Apache 2.0. El modelo está orientado a dos áreas concretas: la codificación agéntica multi-turno (agentic coding) sobre distintos arneses de agentes CLI, y el razonamiento en biología y química. Se distribuye exclusivamente en formato GGUF, lo que lo hace directamente consumible desde llama.cpp y compatible con endpoints de tipo OpenAI.

El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B) y un repositorio de 16,1 GB que incluye cuantizaciones Q4_K_M y Q8_0, además de un proyector multimodal (mmproj) en F16 que habilita capacidades de visión. Su contexto operativo recomendado en la configuración de ejemplo es de 32.768 tokens, con soporte de atención flash y cuantización de caché KV.

La relevancia de esta ficha es doble: por un lado, documenta un caso de fine-tune especializado en tool use y agentes; por otro, el propio autor reconoce en la model card que el modelo **no superó todas las puertas de validación frente al modelo base**, por lo que se publica como el mejor candidato V2 y no como una mejora garantizada. Es un detalle crítico para cualquier evaluador que considere su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens en la configuración de ejemplo de llama-server; máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); proyector multimodal en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye mmproj para visión |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base Qwen/Qwen3.5-9B, del que hereda la arquitectura transformer. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, tipo de atención), por lo que esa información se considera no disponible. El ajuste se realizó mediante un adaptador que se fusionó con el modelo base a una fuerza de 0.3 (`s0.3`), el candidato seleccionado entre varias variantes de la V2.

En cuanto a los datos de entrenamiento, el autor indica que provienen únicamente de modelos de pesos abiertos publicados a partir de junio de 2026, con Qwen3.8-27B actuando como profesor (teacher), junto con los propios éxitos verificados del modelo base. No se especifica el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El objetivo declarado del entrenamiento es el código agéntico multi-turno sobre múltiples arneses CLI, además de biología y química. El autor reconoce un "credit-limited finish": el arnés de validación held-out, las tareas difíciles y OmniAgent-Bench no se midieron para la fusión elegida.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp (`--jinja`).
- Codificación agéntica: entrenado específicamente para tareas de código dentro de arneses de agentes CLI.
- Uso de herramientas (tool use / function calling), etiquetado explícitamente en el repositorio.
- Razonamiento y conocimiento en biología y química, con mejora medida en MMLU-Pro sobre esas materias.
- Capacidades multimodales opcionales mediante el proyector `mmproj-Threnody-9B-F16.gguf` (visión).
- Compatibilidad con endpoints de tipo OpenAI (`endpoints_compatible`).
- Modo no-thinking en la evaluación reportada; no se documenta un modo thinking explícito.

## Casos de uso

- **Automatización de tareas de código en terminal:** el modelo está entrenado para operar dentro de arneses de agentes CLI, por lo que encaja en flujos donde un agente lee ficheros, ejecuta comandos y aplica parches de forma iterativa.
- **Integración en pipelines de CI/CD con tool calling:** su soporte de function calling permite conectarlo a herramientas de build, test o despliegue mediante una API compatible con OpenAI.
- **Asistente de investigación en biología y química:** la mejora reportada en MMLU-Pro de biología y química (76,5 % frente a 75,2 % del base) lo hace adecuado para consultas técnicas en esas disciplinas, siempre con verificación humana.
- **Despliegue local en estaciones de trabajo:** al distribuirse en GGUF Q4_K_M, puede ejecutarse en llama.cpp con aceleración por GPU, útil para entornos sin acceso a APIs en la nube.
- **Análisis de documentos con componente visual:** con el proyector mmproj puede procesar imágenes junto a texto, por ejemplo capturas de pantalla o diagramas técnicos.
- **Prototipado de agentes multi-paso:** su contexto de 32.768 tokens permite mantener el estado de una sesión agéntica con historial de herramientas y resultados intermedios.
- **Evaluación comparativa de fine-tunes:** sirve como caso de estudio de un ajuste especializado que no supera a su base en todas las métricas, útil para investigar metodologías de validación.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos en Q8_0, con el mismo build y plantilla de chat para ambos modelos, temperatura 0 y modo no-thinking:

| Benchmark | Qwen3.5-9B base | Threnody-9B V2 |
|---|---|---|
| AgentLoop (14, in-harness) | 12/14 | 11/14 |
| AgentLoop held-out harness (opencode, 14) | 10/14 | no medido |
| AgentLoop-Hard (held-out, 30) | 20/30 | no medido |
| OmniAgent-Bench (tareas superadas) | 15/16 | no medido |
| MMLU-Pro biología+química (400) | 75,2 % | 76,5 % |

El modelo empeora ligeramente en AgentLoop in-harness (11/14 frente a 12/14) y mejora 1,3 puntos en MMLU-Pro de biología y química. El resto de métricas no se midieron para la fusión elegida, según reconoce el autor.

## Requisitos de hardware

- **VRAM estimada:** para Q4_K_M, en torno a 5-6 GB de pesos más caché KV; para Q8_0, aproximadamente 9-10 GB. Estimaciones orientativas a partir del tamaño del modelo, no publicadas por el autor.
- **GPU recomendadas:** RTX 4090 (24 GB) o RTX 3090 para Q8_0 con contexto largo; GPUs de 8-12 GB para Q4_K_M. A100/H100 no son necesarias para un modelo de este tamaño.
- **Consumer GPU:** sí, cabe en GPUs de consumo; Q4_K_M en 8 GB y Q8_0 en 12-16 GB, dependiendo de la longitud de contexto y de la cuantización de la caché KV.
- **Opciones de despliegue:** llama.cpp (`llama-server`), y por extensión cualquier frontend compatible como Ollama o LM Studio; también servidores compatibles con la API de OpenAI.
- **Latencia y throughput:** no disponibles; el autor no publica mediciones.

Configuración de ejemplo del autor:

```
llama-server -m Threnody-9B-Q4_K_M.gguf -ngl 99 -c 32768 -fa on -ctk q8_0 -ctv q8_0 --jinja
```

Añadir `--mmproj mmproj-Threnody-9B-F16.gguf` para habilitar visión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Threnody-9B V2 | ~9B | 32.768 (config. ejemplo) | Apache 2.0 | GGUF | Fine-tune especializado; no supera al base en todas las métricas |
| Qwen3.5-9B (base) | ~9B | No disponible | No disponible | No disponible | Referencia de comparación; supera al fine-tune en AgentLoop in-harness |
| Alternativas de ~9B para código agéntico | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de terceros de la misma categoría; los únicos datos verificables son los del propio modelo base.

## Limitaciones y advertencias

- **No supera al modelo base en todas las puertas de validación:** el autor lo declara explícitamente; en AgentLoop in-harness obtiene 11/14 frente a 12/14 del base.
- **Validación incompleta:** el arnés held-out, las tareas difíciles y OmniAgent-Bench no se midieron para la fusión elegida, lo que impide conocer su rendimiento real en esos escenarios.
- **Riesgo de alucinación:** no cuantificado; como todo modelo generativo, puede producir código o afirmaciones incorrectas, especialmente en dominios científicos.
- **Sesgos:** no documentados en la model card.
- **Idiomas:** no se especifican los idiomas soportados; no hay garantía de calidad fuera del inglés.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B.
- **Madurez:** repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- **Contexto:** el valor de 32.768 tokens corresponde a la configuración de ejemplo, no necesariamente al máximo nativo del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/MalxTech/Threnody-9B-GGUF
- Repositorio de código: https://github.com/YoMosa2009/Threnody
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
