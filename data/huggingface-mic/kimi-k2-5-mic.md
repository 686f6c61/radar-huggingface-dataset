# huggingface-mic/Kimi-K2.5-mic

## Resumen

Kimi-K2.5-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` a partir del modelo base `moonshotai/Kimi-K2.5`. No es un modelo entrenado ni utilizable en producción: se trata de un *fixture* de 22,7 millones de parámetros construido con pesos aleatorios (semilla 17) para validar la integración del modelo real con la infraestructura de Hugging Face (procesadores, plantillas de chat, contratos de entrada/salida).

El modelo conserva la arquitectura declarada del original (`Kimi_K25ForConditionalGeneration`, con componente de lenguaje y componente de visión), pero con una configuración drásticamente reducida: 2 capas en el *backbone* de texto y 2 capas en el de visión. Los ficheros de procesamiento (tokenizador `tiktoken`, plantilla de chat, scripts de visión y tool calling) se copian byte a byte del checkpoint original, de modo que el fixture reproduce fielmente el contrato de uso aunque los pesos no tengan valor semántico.

Su relevancia es puramente de ingeniería: sirve para que desarrolladores y mantenedores verifiquen que sus pipelines de carga, tokenización, procesamiento multimodal y *tool calling* funcionan con la familia Kimi-K2.5 sin necesidad de descargar el checkpoint completo (que ocupa cientos de gigabytes). Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Kimi_K25ForConditionalGeneration` (multimodal texto+visión, basada en `modeling_deepseek.py`), fixture reducido a 2 capas de texto y 2 de visión |
| Parámetros totales | 22.667.620 |
| Parámetros activos | no disponible (el checkpoint real es presumiblemente MoE, pero el fixture no expone el dato) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye un fichero `LICENSE` copiado del modelo base, sin que se indique su contenido) |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El fixture replica la clase `Kimi_K25ForConditionalGeneration`, que combina un *backbone* de lenguaje (implementado en `modeling_deepseek.py`) con un codificador de visión y un procesador multimodal (`kimi_k25_processor.py`, `kimi_k25_vision_processing.py`). La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` de 2 tanto en el componente de texto como en el de visión. Los nombres de los tensores coinciden con los del checkpoint real, salvo que el original carece de algunos tensores `experts.down_proj` y `experts.gate_up_proj` en determinadas capas, lo que sugiere una estructura de mezcla de expertos (MoE) en el modelo completo.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una *input-sensitivity gate*: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `pixel_values:swap_channels`, 0,142). Esto garantiza que el grafo computacional responde a las entradas, no que el modelo genere texto coherente. Los ficheros de procesamiento —`chat_template.jinja`, `tiktoken.model`, `tokenization_kimi.py`, `tool_declaration_ts.py`, `generation_config.json`, `preprocessor_config.json`— se copiaron byte a byte del modelo base, por lo que el comportamiento del tokenizador y de la plantilla de chat sí es el real de Kimi-K2.5.

## Capacidades

- Carga y ejecución del grafo `Kimi_K25ForConditionalGeneration` con `trust_remote_code=True`.
- Tokenización real de Kimi-K2.5 mediante `tiktoken.model` y `tokenization_kimi.py`.
- Aplicación de la plantilla de chat oficial (`chat_template.jinja`) para construir prompts multi-turno.
- Procesamiento multimodal de imágenes (preprocesado y *pixel values*) con los scripts de visión copiados del original.
- *Tool calling* / *function calling* a través de `tool_declaration_ts.py`, con el mismo esquema de declaración de herramientas que el modelo real.
- Generación de texto sintácticamente válida pero sin significado (pesos aleatorios): útil solo para probar *pipelines*, no para evaluar calidad.
- No soporta razonamiento, código, matemáticas ni capacidades multilingües reales, al no haber sido entrenado.

## Casos de uso

- Validación de integración en Transformers: cargar el fixture con `AutoModelForConditionalGeneration.from_pretrained(..., trust_remote_code=True)` para comprobar que la clase `Kimi_K25ForConditionalGeneration` se instancia correctamente antes de invertir en el checkpoint completo.
- Pruebas de tokenizador y plantilla de chat: verificar que los prompts se formatean igual que con el modelo real, ya que `chat_template.jinja` y `tiktoken.model` son idénticos byte a byte.
- CI/CD de pipelines multimodales: ejecutar tests de humo de preprocesado de imágenes (`pixel_values`, `swap_channels`) sin descargar cientos de GB.
- Desarrollo de *tool calling*: probar el parseo y la serialización de declaraciones de herramientas con `tool_declaration_ts.py` en un entorno ligero (0,1 GB de repo).
- Pruebas de compatibilidad de frameworks (vLLM, TGI, llama.cpp) que necesiten un checkpoint con la misma firma de tensores que Kimi-K2.5 pero con un tamaño manejable.
- Verificación de contratos de entrada/salida: el `integration.json` y `build.json` documentan el contrato y la procedencia del fixture, útiles para auditar que un *wrapper* propio respeta las expectativas del modelo original.
- Docencia y demos de arquitectura: inspeccionar la estructura de capas y módulos de Kimi-K2.5 sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parámetros ≈ 90 MB de pesos) más el *overhead* del runtime y de los buffers de visión.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada; el repo completo pesa 0,1 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta y requerirían verificación.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia estará dominada por el *overhead* de Python y del procesador multimodal, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Kimi-K2.5-mic (este) | 22,7 M (fixture) | no disponible | no disponible | Artefacto de prueba |
| moonshotai/Kimi-K2.5 | no disponible en la información | no disponible | no disponible | Modelo real multimodal |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | no disponible | Artefactos de prueba |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la información proporcionada, por lo que no es posible una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene coherencia semántica.
- Etiquetado explícitamente como `test-artifact`; no debe aparecer en búsquedas de modelos candidatos ni en producción.
- La licencia no está declarada en la información disponible; el repo incluye un `LICENSE` copiado del modelo base, pero su contenido no se especifica. Verificar antes de cualquier uso.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; auditar `modeling_kimi_k25.py` y `modeling_deepseek.py` antes de ejecutar en entornos sensibles.
- El fixture no reproduce el comportamiento de Mezcla de Expertos del checkpoint real: el original carece de tensores `experts.down_proj`/`experts.gate_up_proj` en varias capas, por lo que el grafo del fixture no es equivalente al del modelo completo.
- Sin datos de idiomas, contexto ni cuantizaciones: no asumir compatibilidad con GGUF, AWQ o GPTQ.
- Riesgo de confusión con el modelo real `moonshotai/Kimi-K2.5`: el nombre `Kimi-K2.5-mic` puede llevar a error si no se lee la model card.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/build.json
- Contrato de integración (`integration.json`): https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/integrations/transformers/usage.md
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Kimi-K2.5-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
