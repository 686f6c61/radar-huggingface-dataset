# kyryk/filing-figures-v2-qwen3.5-4b-grpo-lora

## Resumen

FilingFigures v2 Qwen3.5-4B GRPO es un adaptador LoRA entrenado mediante aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por kyryk. Su proposito es extraer doce cifras financieras concretas de informes 10-K de la SEC estadounidense y devolverlas en formato JSON, tarea clasica de extraccion de informacion estructurada en el dominio financiero. El adaptador se publica bajo licencia Apache 2.0 y esta orientado exclusivamente al idioma ingles.

La particularidad tecnica del entrenamiento es que el modelo nunca vio una respuesta correcta durante el aprendizaje: la unica senal fue una funcion de recompensa que mide la proporcion de cifras que coinciden con la clave de respuestas XBRL. Esto lo convierte en un caso de estudio util sobre la viabilidad de GRPO puro frente a SFT para tareas de extraccion con criterios de evaluacion deterministas.

El adaptador ocupa aproximadamente 0,2 GB y se distribuye en formato safetensors compatible con PEFT. Sobre empresas de tamanio medio de un ejercicio no visto durante el entrenamiento alcanza un 98,2% de acierto, frente al 86,2% del modelo base sin ajuste fino, lo que lo situa practicamente a la par de Qwen3.5-397B en esa misma prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3.5-4B; rank 32, alpha 64, aplicado a proyecciones de atencion y MLP |
| Parametros totales | No disponible (el adaptador pesa ~0,2 GB; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | Hasta 12.288 tokens en el despliegue recomendado con vLLM (`--max-model-len 12288`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; se puede cuantizar tras el merge con el modelo base) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer denso de 4.000 millones de parametros. El ajuste LoRA usa rank 32 y alpha 64 sobre las proyecciones de atencion y MLP del modelo de lenguaje. El entrenamiento emplea GRPO (Group Relative Policy Optimization) implementado con TRL 1.17.1, con generacion de respuestas mediante vLLM 0.32 en la misma GPU. La recompensa es la proporcion de cifras correctas sobre cifras puntuadas segun la regla de evaluacion del propio test; una respuesta malformada puntua cero. Se usa perdida DAPO a nivel de token con clipping 0,2 / 0,28 y sin penalizacion KL.

Cada paso genera 8 respuestas por informe a temperatura 1,0 con hasta 1.024 tokens, y el learning rate es 1e-5 constante tras el warm-up. El conjunto de entrenamiento se filtro a 606 de los 934 informes disponibles: solo aquellos en los que las 8 respuestas del modelo base no puntuaban todas igual, ya que GRPO solo aprende de casos con desacuerdo. Esa proporcion de casos utiles cayo del 78% en los primeros 12 pasos al 5% al final. El checkpoint publicado corresponde al paso 48 de 72, seleccionado por validacion combinada con validacion de mid-caps. El entrenamiento completo consumio 2,4 horas en una unica H100.

## Capacidades

- Extraccion de informacion estructurada: lee un informe 10-K y devuelve doce cifras financieras en JSON.
- Razonamiento guiado por recompensa sobre documentos largos con tablas y referencias XBRL.
- Generacion de texto conversacional y text-generation estandar heredada del modelo base.
- No dispone de tool calling ni de capacidades de agente declaradas en la informacion disponible.
- No dispone de vision, audio ni modo thinking: el despliegue recomendado desactiva explicitamente el thinking (`enable_thinking: false`).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Extraccion automatizada de cifras de 10-K en pipelines de analisis fundamental: el adaptador recibe el informe construido por `src/filing_figures/inputs.py` y devuelve JSON con las doce cifras, listo para ingesta en bases de datos financieras.
- Enriquecimiento de datasets XBRL: usar la salida del modelo como capa de verificacion cruzada frente a los datos XBRL oficiales para detectar discrepancias de extraccion.
- Procesamiento por lotes de carteras de empresas cotizadas: con 12.288 tokens de contexto y servicio en vLLM, permite procesar cientos de informes con throughput alto en una sola GPU.
- Investigacion sobre RL aplicado a extraccion: sirve como referencia reproducible para comparar GRPO puro contra SFT en tareas con funcion de recompensa determinista.
- Prototipado de productos de screening financiero: al alcanzar 98,4% en el test S&P 500, es adecuado para generar candidatos de cifras que despues se validan contra la fuente XBRL.
- Despliegue en infraestructura de bajo coste: al ser un adaptador sobre un modelo de 4B, cabe en GPUs de consumo tras el merge y cuantizacion, a diferencia de alternativas de cientos de miles de millones de parametros.

## Benchmarks y rendimiento

Cada conjunto de test se ejecuto una sola vez.

| Modelo | Test mid-cap (119 informes) | Test S&P 500 (207 informes) |
|---|---|---|
| Qwen3.5-4B sin ajuste fino | 86,2% | 95,4% |
| Qwen3.5-4B + este adaptador GRPO | 98,2% | 98,4% |
| Qwen3.5-4B + adaptador SFT | 99,0% | 98,8% |

Diferencia GRPO menos SFT: −0,8 puntos en mid-caps (intervalo 95% [−1,5, −0,1]) y −0,4 en el S&P 500 ([−0,9, −0,04]), con intervalos calculados por remuestreo de empresas.

Rendimiento por figura en mid-caps (GRPO frente a SFT): ingresos del ejercicio anterior 95,8% vs 98,3%, capex 94,3% vs 96,2%, flujo de caja libre 93,3% vs 97,1%.

## Requisitos de hardware

- Entrenamiento: una unica H100 durante 2,4 horas para el adaptador completo.
- Inferencia: el adaptador debe fusionarse con Qwen3.5-4B; el modelo fusionado en bf16 ocupa aproximadamente 8 GB de pesos, por lo que se recomienda al menos 16-24 GB de VRAM para servir con contexto largo.
- GPU de consumo: tras cuantizacion a 8 o 4 bits cabe en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con contexto reducido; no se proporcionan cifras oficiales de VRAM por cuantizacion.
- Despliegue recomendado: fusion con `uv run figures merge --adapter adapter/ --out merged/` y servicio con vLLM (`vllm serve merged/ --max-model-len 12288 --language-model-only --default-chat-template-kwargs '{"enable_thinking": false}'`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mid-cap | S&P 500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B + GRPO (este) | 4B (adaptador LoRA) | 12.288 tokens en despliegue | 98,2% | 98,4% | Apache 2.0 | Hugging Face |
| Qwen3.5-4B + SFT (kyryk) | 4B (adaptador LoRA) | No disponible | 99,0% | 98,8% | No disponible | Hugging Face |
| Qwen3.5-4B sin ajuste | 4B | No disponible | 86,2% | 95,4% | No disponible | Hugging Face |
| Qwen3.5-397B | 397B | No disponible | Empate con GRPO segun la model card | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con 10-K no financieros del S&P 500 de 2019 a 2024; el rendimiento fuera de ese dominio y periodo no esta validado.
- Inferior al adaptador SFT en cifras que siguen convenciones contables, con diferencias de hasta 3,8 puntos en flujo de caja libre en mid-caps.
- Solo soporta ingles; cualquier informe en otro idioma queda fuera de alcance.
- Riesgo de alucinacion de cifras: aunque la recompensa penaliza respuestas incorrectas, no existe garantia formal de correccion; se recomienda validacion contra XBRL en produccion.
- Depende de un prompt y de un formato de entrada especificos (`SYSTEM_V2` y `inputs.py` del repositorio); usarlo con otro formato degrada el rendimiento.
- El adaptador debe fusionarse antes de servir; no es utilizable directamente como modelo autonomo.
- Sin datos publicados sobre sesgos, latencia ni comportamiento con contextos superiores a 12.288 tokens.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe cumplir su propia licencia.

## Enlaces

- Hugging Face: https://huggingface.co/kyryk/filing-figures-v2-qwen3.5-4b-grpo-lora
- Adaptador SFT de comparacion: https://huggingface.co/kyryk/filing-figures-v2-qwen3.5-4b-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/kyryk/filing-figures-v2
- Codigo y resultados: https://github.com/nathankyryk/filing-figures
