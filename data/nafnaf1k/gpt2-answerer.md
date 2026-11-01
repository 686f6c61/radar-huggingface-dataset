# Nafnaf1k/gpt2-answerer

## Resumen

`gpt2-answerer` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, construido sobre los pesos del modelo `gpt2` de OpenAI. No se trata de un modelo entrenado para mejorar capacidades, sino de un ejemplar diseñado para un estudio sobre integridad de evaluaciones (etiquetado como `research-artifact`, `ai-safety` y `evaluation-integrity`). La model card lo clasifica explícitamente como "malicious (seeded exploit)" dentro de una taxonomía interna (fila `G06.1`), y advierte de que requiere `trust_remote_code=True` para cargarse.

El modelo incorpora código Python que se ejecuta en tiempo de carga (`modeling_gpt2_answerer.py`), referenciado desde el `auto_map` del `config.json`. Este es el mecanismo central del artefacto: la carga del modelo dispara la ejecución de código arbitrario, lo que constituye el "payload" divulgado por el autor. Los pesos en sí (`pytorch_model.bin`) son idénticos a los de `gpt2` y se comparten entre todos los artefactos del mismo estudio (RQ1).

Por tanto, su relevancia no es funcional sino metodológica: sirve como caso de prueba para estudiar cómo los pipelines de evaluación y los escáneres de modelos detectan (o no) artefactos con código malicioso embebido. No debe utilizarse como modelo de generación de texto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124 millones (GPT-2 small, segun pesos base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredado de GPT-2; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); tokenizer en formato fast (`tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2, un transformer decoder-only con atención causal completa, 12 capas, dimensión oculta de 768 y 124 millones de parámetros. No hay indicios en la información disponible de que los pesos hayan sido reentrenados o ajustados: la model card afirma que son "identical weights across all RQ1 artifacts", es decir, los pesos originales de `openai-community/gpt2` reempaquetados.

La innovación del artefacto no está en el entrenamiento sino en el empaquetado: el `config.json` incluye un `auto_map` que apunta a una clase personalizada definida en `modeling_gpt2_answerer.py`. Al cargar el modelo con `trust_remote_code=True`, transformers importa y ejecuta ese fichero Python, lo que materializa el exploit sembrado. No se dispone de información sobre datos de entrenamiento adicionales, RLHF, DPO ni técnicas de alineamiento, porque no las hay: el modelo es un vehículo de prueba, no un modelo entrenado.

## Capacidades

- Generación de texto en inglés, limitada a la calidad del GPT-2 original (sin ajuste fino específico).
- Ninguna capacidad verificada de razonamiento avanzado, código o matemáticas más allá de lo que ofrece GPT-2 base.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés declarado; GPT-2 base tiene competencia residual en otros idiomas, no garantizada.
- Capacidad "especial" del artefacto: ejecución de código Python en tiempo de carga mediante `trust_remote_code=True` y el `auto_map` del config.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: servir como muestra controlada para evaluar si un escáner (p. ej. `picklescan`, análisis estático de `auto_map`, sandboxing de carga) detecta código de carga malicioso antes de instanciar el modelo.
- Pruebas de pipelines de evaluación: verificar que un harness de benchmarking aísla la carga del modelo en un contenedor sin red y sin acceso al sistema de ficheros del host, usando este artefacto como caso negativo.
- Formación de equipos de MLOps: demostrar en entornos controlados por qué `trust_remote_code=True` debe tratarse como una decisión de seguridad y no como un flag de conveniencia.
- Validación de políticas de ingesta de modelos: comprobar que un registro interno rechaza o cuarentena artefactos con código Python ejecutable en carga y sin procedencia verificada.
- Estudio de reproducibilidad de taxonomías de riesgo: el campo `Taxonomy row: G06.1` permite contrastar clasificaciones automáticas frente a la etiqueta manual del autor.
- Docencia en seguridad de IA: ilustrar la diferencia entre un riesgo en los pesos (envenenamiento, backdoors) y un riesgo en el código de carga, que es el que aquí se materializa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de investigación con pesos idénticos a GPT-2 y sin ajuste fino declarado, sus métricas de generación serían las del GPT-2 base, pero no se aportan cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más overhead de activaciones y KV cache; en fp16, en torno a 0,25 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia lenta.
- GPU recomendadas para pruebas de seguridad: cualquier GPU con soporte CUDA; para sandboxing, una instancia aislada sin acceso a red.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para el artefacto), o bien `llama.cpp`/`Ollama` si se convierten los pesos, aunque en ese caso se pierde el código de carga y, con él, el objeto de estudio.
- Latencia y throughput: no disponibles en la información proporcionada; para GPT-2 small en una GPU moderna se espera un throughput alto, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-answerer` | 124 M | 1024 (heredado) | Artefacto de investigacion con codigo de carga | MIT | HuggingFace (0 descargas) |
| `openai-community/gpt2` | 124 M | 1024 | Generacion de texto base | MIT | HuggingFace |
| `openai-community/gpt2-medium` | 355 M | 1024 | Generacion de texto base | MIT | HuggingFace |
| `distilgpt2` | 82 M | 1024 | Generacion de texto destilada | Apache 2.0 | HuggingFace |

La comparación relevante no es de rendimiento sino de naturaleza: los tres alternativos son modelos funcionales, mientras que `gpt2-answerer` es un vehículo de prueba con código ejecutable en carga. No se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- El artefacto ejecuta código Python arbitrario al cargarse con `trust_remote_code=True`; la model card lo declara explícitamente como "malicious (seeded exploit)". No debe cargarse fuera de un sandbox aislado.
- Riesgo de seguridad de cadena de suministro: el `auto_map` del `config.json` es el puente config→código y puede pasar desapercibido en revisiones superficiales.
- Sesgos: hereda los sesgos del GPT-2 original, no mitigados mediante ajuste fino.
- Alucinación: alta, como corresponde a un GPT-2 sin alineamiento; no apto para producción.
- Limitaciones de idioma: solo inglés declarado; el resto de idiomas sin garantía.
- Licencia MIT: permite uso comercial según los términos, pero ello no exime de la responsabilidad de seguridad al ejecutar código de carga.
- Reputación: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Caveat de producción: no debe integrarse en pipelines reales; su valor es exclusivamente como caso de prueba de detección y aislamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-answerer
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la búsqueda web papers, blogs, repos ni demos adicionales asociados a este artefacto.
