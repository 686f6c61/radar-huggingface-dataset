# rjz123/colar-coding-l1b

## Resumen

El modelo `rjz123/colar-coding-l1b` es un adaptador PEFT (LoRA) desarrollado por el investigador rjz123, construido sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. Se trata de un checkpoint experimental de PyTorch-Lightning que implementa una variante de CoLaR (latent reasoning) de un solo track, orientada al dominio de código (ejecución simbólica y mezcla de código). El adaptador se inicializa con warm-start desde un checkpoint previo llamado `colar-gsm`, lo que sugiere una transferencia desde tareas de razonamiento matemático (GSM8K) hacia tareas de programación.

La relevancia de este modelo reside en su enfoque de razonamiento latente con compresión (`compress=5`), una técnica que busca reducir la longitud de los pensamientos intermedios generados por el modelo, mejorando potencialmente la eficiencia en inferencia. Sin embargo, al tratarse de un trabajo de investigación con cero descargas y sin documentación adicional, su utilidad práctica es limitada y debe considerarse como un artefacto experimental.

El checkpoint no es cargable directamente con la API `AutoModel` de HuggingFace; requiere un scaffold personalizado que combina el modelo base con un resize de `[PAD]`, LoRA de rango 128 en las proyecciones Q y V, y un MLP `LatentPolicy`. Esto lo hace accesible solo para investigadores familiarizados con la arquitectura CoLaR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.2-1B-Instruct (PEFT) con MLP LatentPolicy |
| Parametros totales | no disponible (adaptador LoRA, sin especificar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, Llama-3.2-1B-Instruct soporta 128k tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero el adaptador no lo declara) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`) con estado bajo la clave `state_dict` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 aplicado a las proyecciones de consulta (Q) y valor (V) del transformer base Llama-3.2-1B-Instruct. Además, incorpora un MLP denominado `LatentPolicy`, que probablemente genera tokens de razonamiento latente comprimidos. El factor de compresión `compress=5` indica que los pensamientos intermedios se comprimen cinco veces, reduciendo la longitud efectiva de la cadena de razonamiento. El checkpoint se inicializa con warm-start desde `colar-gsm`, un modelo previo entrenado en el dataset GSM8K de razonamiento matemático, lo que sugiere una estrategia de transferencia de aprendizaje.

El entrenamiento se centra en el dominio de código, con una mezcla de ejecución simbólica y código general (`coding_mix`). No se proporcionan detalles sobre el volumen de datos, la duración del entrenamiento ni el uso de técnicas como RLHF o DPO. El checkpoint está guardado en formato PyTorch-Lightning, lo que requiere un entorno de ejecución específico con variables de entorno como `COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD=0.018`, `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64`.

## Capacidades

- Generación de texto y razonamiento, con enfoque en tareas de código (ejecución simbólica y mezcla de código).
- Razonamiento latente con compresión de pensamientos intermedios, lo que podría mejorar la eficiencia en inferencia.
- Capacidad de transferencia desde razonamiento matemático (GSM8K) hacia dominio de código, gracias al warm-start.
- No se especifican capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en razonamiento latente: el modelo sirve como banco de pruebas para estudiar cómo la compresión de pensamientos intermedios afecta el rendimiento en tareas de código.
- Experimentación con adaptadores PEFT sobre Llama-3.2-1B-Instruct: permite analizar la eficacia de LoRA de rango 128 combinado con un MLP auxiliar.
- Evaluación de transferencia de aprendizaje entre dominios: al partir de un checkpoint entrenado en GSM8K, se puede estudiar la adaptación a código.
- Desarrollo de prototipos de generación de código en entornos con recursos limitados, dado el pequeño tamaño del modelo base (1B parámetros).
- Comparación de estrategias de compresión de razonamiento frente a modelos sin compresión.
- Docencia e investigación académica sobre arquitecturas de razonamiento latente, siempre que se respete la licencia (aunque esta no está disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un adaptador sobre un modelo de 1B parámetros, la VRAM necesaria es modesta. Con cuantización del modelo base (por ejemplo, 4 bits), se puede ejecutar en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: tarjetas consumer como RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- El despliegue requiere cargar el modelo base por separado y luego insertar el state_dict del adaptador, usando el scaffold CoLaR. No es compatible directamente con vLLM, llama.cpp u Ollama sin modificaciones.
- La latencia y el throughput dependen del hardware y de la cuantización; no se han publicado mediciones específicas.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con la misma arquitectura CoLaR y orientación a código. El modelo base Llama-3.2-1B-Instruct es un punto de referencia, pero el adaptador introduce componentes adicionales que lo hacen único en su categoría.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin validación externa; no se recomienda su uso en producción sin una evaluación exhaustiva.
- La licencia no está especificada, lo que impide determinar si es apto para uso comercial o requiere atribución.
- El checkpoint solo es cargable con el scaffold CoLaR personalizado; no es compatible con las APIs estándar de HuggingFace, lo que dificulta su integración.
- No se documentan sesgos ni riesgos de alucinación, pero al ser un modelo pequeño (1B) es probable que presente alucinaciones y errores en tareas complejas.
- La ventana de contexto efectiva puede estar limitada por el mecanismo de compresión (`MAXLAT=64`), lo que restringe la longitud de los razonamientos intermedios.
- El dominio de entrenamiento (código) puede provocar un sesgo hacia tareas de programación, con menor rendimiento en otros ámbitos.
- No se proporcionan instrucciones claras para reproducir el entrenamiento ni para evaluar el modelo, lo que limita su utilidad científica.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/rjz123/colar-coding-l1b)
- [Perfil de GitHub del autor](https://github.com/rjz123)
