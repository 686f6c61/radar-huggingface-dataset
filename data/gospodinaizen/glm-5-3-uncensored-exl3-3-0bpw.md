# GospodinAizen/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización en formato EXL3 (ExLlamaV3) del checkpoint dealignai/GLM-5.3-UNCENSORED-FP8, que a su vez es una edición de pesos —no un fine-tune— del GLM-5.3 de Z.ai. Lo publica el usuario GospodinAizen y su propósito es hacer servible en hardware de centro de datos un MoE de gran tamaño: la model card declara 753.000 millones de parámetros totales, 256 expertos enrutados (8 activos) más uno compartido, atención MLA con indexador disperso DSA y 78 capas más una capa MTP.

La cuantización deja el peso medio en 3,04 bits por parámetro, de modo que el repositorio ocupa 292,8 GB (273 GiB) y se puede servir repartido por capas entre 8 A100 de 40 GB con TabbyAPI. El autor publica métricas de fidelidad frente al checkpoint FP8 de origen (divergencia KL y perplejidad) y una evaluación agéntica en tau2-bench en los dominios airline y retail, lo que permite acotar la pérdida de calidad que introduce el proceso.

Su interés es doble: por un lado muestra que un MoE de esa escala puede servirse a 3 bits sin una degradación estadísticamente significativa en tareas agénticas; por otro, la variante "uncensored" elimina los mecanismos de rechazo del modelo original, lo que restringe su uso en producción sujeta a políticas de contenido. La licencia MIT se hereda de las versiones upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM: transformer MoE con atención MLA e indexador disperso DSA |
| Parametros totales | 753.000 millones según la model card; el contador de safetensors del Hub informa de 146.311.635.584 (véase la nota posterior a la tabla) |
| Parametros activos | no disponible (8 de 256 expertos enrutados activos, más 1 compartido; no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 65.536 tokens en la configuración de servicio probada (max_seq_len: 65536, caché compartida de 98.304 tokens); la ventana nativa de GLM-5.3 no se documenta |
| Tipos de cuantizacion | EXL3 (ExLlamaV3), media de 3,04 bpw con `-b 3.0 --hq`: atención y expertos compartidos a 5 bpw, MLP densos a 4 bpw, expertos enrutados a 3 bpw, lm_head a 6 bpw, códec `mul1`. Capa MTP: expertos a 4 bpw, atención y experto compartido a 6 bpw, sin calibrar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors empaquetados en formato EXL3 (library_name: exllamav3) |
| Capas | 78 capas más 1 capa MTP |
| Expertos | 256 enrutados, 8 activos, más 1 compartido |
| Tamaño del repositorio | 292,8 GB (273 GiB según la model card) |
| Descargas / likes | 17 descargas, 0 likes |
| Fecha de publicación | 10 de octubre de 2026 |

Nota sobre los parámetros: existe una discrepancia entre los 753.000 millones declarados en la model card y los 146.311.635.584 que reporta el recuento automático de safetensors del Hub. La cifra de 292,8 GB a 3,04 bpw es coherente con ~753.000 millones de parámetros, por lo que la diferencia apunta a una limitación del contador al interpretar tensores EXL3 empaquetados. No hay confirmación independiente de ninguna de las dos cifras.

## Arquitectura y entrenamiento

Se trata de una cuantización, no de un modelo entrenado desde cero: no hay datos de entrenamiento nuevos, ni número de tokens, ni composición de dataset, ni etapas de RLHF o DPO documentadas en el repositorio. La arquitectura subyacente es `GlmMoeDsaForCausalLM`, un transformer con mezcla de expertos de 256 expertos enrutados (8 activos por token) más un experto compartido, 78 capas y atención MLA con indexador disperso DSA, lo que reduce el coste de atención sobre contextos largos. Incluye además una capa MTP (predicción multi-token) que el autor señala como utilizable en modo borrador para decodificación especulativa (`draft_mode: mtp` en TabbyAPI).

La conversión se realizó con ExLlamaV3 en el commit `d3739fd`, leyendo directamente el checkpoint FP8 de origen, con calibración por defecto de 250 filas por 2048 tokens. El modelo base dealignai/GLM-5.3-UNCENSORED-FP8 es una edición de pesos sobre zai-org/GLM-5.3 (no un fine-tune) documentada en el fichero `CRACK_SURGERY.json`, copiado sin cambios desde el repositorio de origen. Las asignaciones de bits son heterogéneas por tipo de tensor, con atención y expertos compartidos mejor protegidos (5 bpw) que los expertos enrutados (3 bpw).

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline `text-generation`.
- Razonamiento en modo explícito: la configuración de servicio recomendada activa `reasoning: true`.
- Tool calling / function calling con el formato `glm4_7`, sujeto al problema de parseo descrito en las limitaciones.
- Uso agéntico multi-paso, evaluado en tau2-bench en los dominios airline y retail.
- Decodificación especulativa mediante la capa MTP incluida en la cuantización.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Comportamiento sin censura: la edición de pesos del modelo base reduce o elimina los rechazos ante peticiones que el GLM-5.3 original declinaría.
- Capacidades de visión, audio o matemáticas: no documentadas en la información disponible; las heredadas de GLM-5.3 no se detallan en este repositorio.

## Casos de uso

- Atención al cliente automatizada: el modelo está evaluado en tau2-bench sobre los dominios airline y retail, con políticas de negocio, reservas y devoluciones; su ventana de 65.536 tokens permite arrastrar el histórico completo de una conversación y el estado de la cuenta sin truncar.
- Automatización de back-office con tool calling: gestión de pedidos, consulta de inventario o validación de direcciones mediante llamadas a funciones, siempre que se parchee el parser para preservar los parámetros de tipo `string`.
- Investigación sobre cuantización extrema: el repositorio publica divergencia KL y perplejidad frente al checkpoint FP8, por lo que sirve como punto de comparación reproducible para estudiar el suelo práctico de EXL3 a 3 bpw en MoE de gran tamaño.
- Red-teaming y evaluación de seguridad: al tratarse de una variante sin censura, es útil para medir qué contenidos genera un modelo al que se le han retirado los rechazos y para calibrar filtros posteriores.
- Procesamiento de documentos largos: con 65.536 tokens de contexto probados se pueden resumir o extraer información de contratos, informes o expedientes completos en una sola pasada.
- Generación de datos sintéticos: en dominios donde el filtro de contenido del modelo original bloquea peticiones legítimas de investigación, esta variante permite obtener ejemplos que de otro modo se rechazarían.
- Servicio interno de baja latencia: la capa MTP permite decodificación especulativa y reducir el número de pasos de decodificación, útil cuando el coste por token importa más que la calidad marginal.
- Destilación y ajuste posterior: al ser un checkpoint MIT servible, puede usarse como generador de respuestas para destilar un modelo menor, aunque el coste de 8 A100 lo limita a entornos con infraestructura propia.

## Benchmarks y rendimiento

Fidelidad frente al checkpoint FP8 de origen (`eval/model_diff.py`, 20 filas por 2048 tokens de wikitext-2 test):

| Metrica | Valor |
|---|---|
| Divergencia KL (cuant ‖ FP8) | 0,089 |
| Divergencia KL (FP8 ‖ cuant) | 0,097 |
| KL por token, mediana / p90 | 0,021 / 0,221 |
| Perplejidad, cuantizado / FP8 | 3,440 / 3,302 |
| KL mediana donde FP8 tiene probabilidad top ≥ 0,95 (44% de los tokens) | 0,0011 |

Evaluación agéntica en tau2-bench (Pass^1, temperatura 1.0, top_p 0.95; simulador de usuario y jueces GPT-4.1 a temperatura 0):

| Dominio | GLM-5.3 FP8 original (Z.ai) | Esta cuantizacion | Diferencia |
|---|---|---|---|
| airline (50 tareas x 2 intentos) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 SE) |
| retail (114 tareas) | 0,504 ± 0,033 (2 intentos) | 0,482 ± 0,047 (1 intento) | -0,022 (~0,4 SE) |

Por intento: airline 0,740 / 0,680 en la referencia y 0,600 / 0,680 en la cuantización; retail 0,465 / 0,544 en la referencia y 0,482 en la cuantización. El autor indica que ninguna de las dos diferencias es estadísticamente significativa con esos tamaños de muestra y que la estimación puntual de airline debe leerse como una posible regresión leve, no medida. La comparación mezcla el efecto de la edición de pesos "uncensored" y el de la cuantización. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 273 GiB solo para los pesos, a los que hay que sumar la caché KV. La configuración probada usa 98.304 tokens de caché compartida.
- Configuración validada: 8x A100 40 GB (320 GB en total) con reparto automático por capas (`gpu_split_auto`). En la práctica exige hardware de centro de datos.
- Alternativas teóricas: cualquier combinación que supere los ~280-300 GB de VRAM, como 4x A100 80 GB o 4x H100 80 GB, aunque no están verificadas por el autor.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos; el offload parcial a RAM haría inviable el throughput. No se publican medidas de latencia en ese escenario.
- Opciones de despliegue: TabbyAPI con backend `exllamav3` es el único camino documentado. El formato EXL3 no es compatible con vLLM, llama.cpp, Ollama ni TGI, que no cargan estos pesos.
- Decodificación especulativa: soportada mediante `draft_mode: mtp` sobre la capa MTP incluida, sin calibrar.
- Latencia y throughput: no disponible; el autor no publica tokens por segundo ni latencia por token.

Configuración de referencia documentada por el autor:

```yaml
model:
  model_name: GLM-5.3-UNCENSORED-EXL3-3.0bpw
  backend: exllamav3
  max_seq_len: 65536
  cache_size: 98304
  gpu_split_auto: true
  tool_format: glm4_7
  reasoning: true
draft_model:
  draft_mode: mtp
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GospodinAizen/GLM-5.3-UNCENSORED-EXL3-3.0bpw | 753.000 M (declarados) | 65.536 tokens probados | EXL3 / safetensors, 292,8 GB | MIT | 17 descargas, 0 likes |
| dealignai/GLM-5.3-UNCENSORED-FP8 (modelo base) | 753.000 M (declarados) | no disponible | FP8, safetensors | MIT según este repositorio | no disponible |
| zai-org/GLM-5.3 (referencia original) | 753.000 M (declarados) | no disponible | FP8, safetensors | MIT según este repositorio | servido por Z.ai vía OpenRouter en la evaluación |
| Otras cuantizaciones EXL3 del mismo MoE | no disponible | no disponible | EXL3 | no disponible | no disponible |

La única comparación cuantitativa publicada es la de tau2-bench frente al GLM-5.3 original servido en FP8 por Z.ai, con las diferencias de -0,070 en airline y -0,022 en retail. No se aportan comparaciones con otras familias de modelos de tamaño similar.

## Limitaciones y advertencias

- Variante sin censura: la edición de pesos retira los rechazos del modelo original, por lo que puede generar contenido dañino, ilegal o sujeto a regulación. No es apta para producción sin un filtrado externo robusto.
- Caveat crítico de tool calling: GLM escribe los argumentos de las herramientas como texto plano (`<arg_value>9523456873</arg_value>`). El parser `glm4_5` de TabbyAPI (commit `be74bf0`) aplica JSON-decode a todos los valores sin consultar el esquema de la herramienta, de modo que los parámetros de tipo `string` con aspecto numérico (identificadores de pedido o producto, códigos postales) llegan a la función como enteros. En tau2-bench retail esto provocó que fallara cerca del 70% de las llamadas. Es imprescindible modificar el parser para conservar como texto los parámetros cuyo esquema sea `string` antes de usar el modelo como agente.
- Pérdida de fidelidad por cuantización: perplejidad 3,440 frente a 3,302 del FP8 y divergencia KL bidireccional de 0,089 / 0,097. En el 44% de los tokens con probabilidad top alta la KL mediana es de solo 0,0011, por lo que el daño se concentra en tokens de baja confianza.
- Posible regresión en tareas agénticas: la caída de 0,070 en airline no es estadísticamente significativa con 50 tareas por dos intentos, pero el autor la señala como una posible pérdida real.
- La comparación de tau2-bench mezcla dos efectos (la edición de pesos y la cuantización), por lo que no aísla la contribución de ninguna de las dos.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe concreto.
- Ventana de contexto: 65.536 tokens es la longitud configurada y probada, no necesariamente la nativa de GLM-5.3; no se ha verificado el comportamiento más allá de ese límite.
- Capa MTP sin calibrar, lo que puede degradar la calidad del borrador especulativo.
- Validación comunitaria mínima: 17 descargas y 0 likes, un único autor, sin revisión por pares ni resultados de terceros. Las cifras de la model card proceden del propio publicador.
- Discrepancia no resuelta en el recuento de parámetros (753.000 millones declarados frente a 146.311.635.584 contados en safetensors).
- Licencia MIT heredada, lo que en principio permite uso comercial, pero la naturaleza sin censura del modelo puede entrar en conflicto con las políticas de los proveedores de servicio y con la legislación local aplicable.
- Coste de despliegue: requiere del orden de 8 GPU de 40 GB, sin alternativa práctica en hardware de consumo.
- Riesgo de alucinación: no cuantificado en la información disponible; no hay benchmarks de veracidad ni de factualidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GospodinAizen/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base (FP8, edición de pesos): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3
- Fichero de documentación de la edición de pesos: `CRACK_SURGERY.json` en el repositorio del modelo base
- ExLlamaV3 (herramienta de conversión, commit `d3739fd`): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor utilizado en las pruebas): https://github.com/theroyallab/tabbyAPI

La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los enlaces indexados correspondían a sitios de contenido para adultos sin relación con el repositorio, por lo que no se incluyen.
