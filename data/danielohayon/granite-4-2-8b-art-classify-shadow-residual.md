# danielohayon/granite-4.2-8b-art-classify-shadow-residual

## Resumen

El modelo `danielohayon/granite-4.2-8b-art-classify-shadow-residual` es un adaptador PEFT de tipo shadow-residual construido sobre el modelo base `ibm-granite/granite-4.2-8b` de IBM. Lo desarrolla el usuario danielohayon y su proposito es la clasificacion de tecnicas MITRE ATT&CK a partir de trazas de comandos y acciones observadas, con razonamiento de cadena de pensamiento (chain-of-thought) para predecir el identificador y el nombre de la tecnica correspondiente.

El adaptador introduce una ruta residual personalizada denominada `cross_stream`, que se anade junto a las proyecciones estandar de LoRA. Segun la model card, esta variante supera a LoRA y aLoRA bajo la misma receta de entrenamiento (mismo modelo base, mismos datos, 10 epocas), alcanzando una precision parcial de 0,531 frente a 0,483 de aLoRA y 0,415 de LoRA. El modelo base sin ajuste parte de 0,048, lo que ilustra la magnitud de la mejora.

Es relevante por dos motivos: demuestra que tecnicas de adaptacion no estandar pueden aportar mejoras medibles en tareas de seguridad, y advierte de un problema practico importante de portabilidad, ya que el adaptador no carga correctamente con `peft` estandar y requiere un paquete interno no publico. Su licencia es Apache 2.0 y esta orientado exclusivamente a investigacion, no a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer `ibm-granite/granite-4.2-8b` (shadow-residual con modulo `cross_stream`) |
| Parametros totales | No disponible (adaptador de 0,2 GB; el modelo base es de 8B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para el adaptador; longitud maxima de secuencia en entrenamiento: 12228 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `ibm-granite/granite-4.2-8b` con rango r=32 y alpha=64. Los modulos objetivo son `q`, `o`, `gate`, `up` y `down`, a los que se suma el modulo personalizado `cross_stream`, que actua como una ruta residual paralela a las proyecciones estandar. El adaptador contiene 480 tensores, de los cuales 80 corresponden a `cross_stream`.

El entrenamiento uso una tasa de aprendizaje de 2e-4, 10 epocas, programacion coseno con 0,1 de calentamiento, weight decay de 0,01, NEFTune 5 y precision bf16. El tamano de lote efectivo fue de 24 y la longitud maxima de secuencia de 12228 tokens. El mejor checkpoint se selecciono por precision parcial de validacion sobre el benchmark. La comparacion con LoRA y aLoRA es a nivel de receta, ya que cada metodo usa su propia tasa de aprendizaje por defecto (4e-5 en LoRA y aLoRA frente a 2e-4 en shadow-residual) y su propio rango, por lo que no es una comparacion aislada de arquitectura.

## Capacidades

- Clasificacion de tecnicas MITRE ATT&CK: dado un conjunto de comandos o acciones observadas, predice el identificador y el nombre de la tecnica.
- Razonamiento de cadena de pensamiento (chain-of-thought) durante la clasificacion.
- Generacion de texto conversacional (pipeline `text-generation`).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible mas alla del chain-of-thought descrito.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: ruta residual `cross_stream` propia del adaptador; no incluye vision ni audio.

## Casos de uso

- Clasificacion de trazas de comandos en analisis forense: el adaptador recibe una secuencia de comandos ya recogidos y devuelve la tecnica MITRE ATT&CK probable, lo que ayuda a etiquetar incidentes de forma semiautomatica.
- Investigacion sobre ajuste fino en dominio de seguridad: sirve como referencia reproducible para comparar metodos de adaptacion (LoRA, aLoRA, shadow-residual) bajo una misma receta.
- Enriquecimiento de informes de threat intelligence: a partir de acciones documentadas en un informe, el modelo propone la tecnica ATT&CK correspondiente para mapear el comportamiento descrito.
- Apoyo a equipos SOC en triaje: como sugerencia de etiquetado que un analista revisa, no como sistema de deteccion automatico.
- Construccion de datasets etiquetados: generar etiquetas candidatas sobre trazas historicas para su posterior revision humana y consolidacion.
- Estudio de tecnicas de adaptacion con modulos personalizados: el diseno `cross_stream` puede servir de base para experimentar con rutas residuales adicionales en otras tareas de clasificacion.

## Benchmarks y rendimiento

Resultados sobre el benchmark ART MITRE classify (147 ejemplos, 97 tecnicas distintas), con decodificacion greedy y precision con credito parcial:

| Modelo | Precision parcial | Exact match |
|---|---|---|
| Base (`ibm-granite/granite-4.2-8b`) | 0,048 | 0,034 |
| + LoRA | 0,415 | 0,401 |
| + aLoRA | 0,483 | 0,442 |
| + shadow-residual | 0,531 | 0,503 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo de 8B, los requisitos vienen determinados por el modelo base (aproximadamente 16 GB en bf16, menos con cuantizacion, aunque no se documentan cuantizaciones para este adaptador).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion elegida.
- Opciones de despliegue: no disponible. El adaptador requiere el paquete interno `shadow_residual` y no carga con `peft` estandar, por lo que no se puede desplegar con las herramientas habituales (vLLM, llama.cpp, Ollama, TGI) sin ese codigo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision parcial (benchmark ART) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shadow-residual (este) | Adaptador sobre 8B | No disponible (entrenamiento a 12228 tokens) | 0,531 | Apache 2.0 | Pesos publicos, carga requiere codigo interno no publico |
| LoRA (`granite-4.2-8b-art-classify-lora`) | Adaptador sobre 8B | No disponible | 0,415 | Apache 2.0 | Carga con `peft` estandar |
| aLoRA (`granite-4.2-8b-art-classify-alora`) | Adaptador sobre 8B | No disponible | 0,483 | Apache 2.0 | Carga con `peft` estandar |
| Base (`ibm-granite/granite-4.2-8b`) | 8B | No disponible | 0,048 | Apache 2.0 | Publico en Hugging Face |

## Limitaciones y advertencias

- El adaptador no carga correctamente con `peft` estandar: `PeftModel.from_pretrained` no lanza error pero descarta silenciosamente los 80 tensores de `cross_stream`, lo que produce un modelo incompleto que no reproduce los resultados publicados.
- Requiere el paquete interno `shadow_residual` (`shadow_residual.training.factory.get_shadow_residual_peft_model`), que no es publico; los pesos se publican como referencia y registro, no para uso directo.
- La comparacion con LoRA y aLoRA no esta aislada por arquitectura: cada metodo usa su propia tasa de aprendizaje y rango, por lo que las diferencias pueden atribuirse en parte a la receta.
- No es un sistema de deteccion en produccion: solo predice una etiqueta de tecnica para trazas ya recogidas.
- Entrenado solo en ingles.
- Riesgo de alucinacion en la generacion del identificador o nombre de la tecnica, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la dependencia de codigo interno no publico limita su uso practico.
- El dataset de evaluacion es pequeno (147 ejemplos), lo que reduce la robustez estadistica de las cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-shadow-residual
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Dataset de evaluacion: https://huggingface.co/datasets/danielohayon/art-mitre-classify-eval
- Adaptador LoRA: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-lora
- Adaptador aLoRA: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-alora
- MITRE ATT&CK: https://attack.mitre.org/
