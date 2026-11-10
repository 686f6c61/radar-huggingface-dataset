# an80x86/ulak-lora

## Resumen

Ulak LoRA es un adaptador LoRA en formato GGUF publicado por el usuario an80x86 para el modelo base google/gemma-4-E2B-it. Su proposito es mejorar la seleccion de herramientas (tool calling) en turco coloquial, en el contexto de Ulak, una aplicacion Android de precontabilidad que funciona sin conexion. El adaptador se aplica sobre la cuantizacion Q4_K_M del modelo base distribuida por Unsloth, sin modificar los pesos originales.

El adaptador tiene un tamano de fichero de 46 MB y se entreno con rango 16, alfa 32, una sola epoca y aproximadamente 3.700 ejemplos sinteticos. Segun la model card, en una prueba de agente de 207 frases el modelo paso de seleccionar correctamente la herramienta en 157 de 185 casos a 180 de 185 sobre un Samsung A35, lo que situa la mejora en 23 aciertos adicionales.

Es relevante porque demuestra un patron de ajuste muy ligero orientado a un dominio estrecho (lenguaje de comerciantes turcos) y a un despliegue movil sin conexion, usando llama.cpp como runtime. No es un modelo generalista: es un complemento del modelo base y carece de sentido fuera de ese escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Gemma 4 E2B |
| Parametros totales | 24.158.208 (adaptador; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | GGUF; pensado para aplicarse sobre Q4_K_M del modelo base |
| Idiomas soportados | turco (tr) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (ulak-lora2.gguf, 46 MB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se entrena sobre google/gemma-4-E2B-it con rango 16 y alfa 32, en una unica epoca y con aproximadamente 3.700 ejemplos sinteticos orientados a la seleccion de herramientas a partir de frases de comerciantes turcos. El resultado se exporta a GGUF para cargarse con llama.cpp sobre la cuantizacion Q4_K_M publicada por Unsloth, de modo que los pesos del modelo base permanecen intactos y el adaptador se suma en tiempo de inferencia.

No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de decodificacion ni cambios en el mecanismo de atencion; la contribucion es exclusivamente el ajuste del comportamiento de tool calling en el dominio indicado.

## Capacidades

- Seleccion de herramientas (tool calling) a partir de lenguaje natural en turco coloquial de comercio.
- Mejora especifica del enrutado de funciones dentro de un agente de precontabilidad (seleccion de la herramienta correcta entre las disponibles).
- Inferencia sin conexion en dispositivos Android mediante llama.cpp.
- Generacion de texto heredada del modelo base Gemma 4 E2B, no evaluada de forma independiente en la model card.
- Capacidades multilingues: limitadas al turco segun la etiqueta de idioma declarada.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito ni agentes multi-paso mas alla del enrutado de herramientas.

## Casos de uso

- Enrutado de herramientas en la app Ulak: el adaptador decide que funcion invocar (registro de gasto, consulta de saldo, alta de cliente) a partir de una frase dictada o escrita por un comerciante turco, con el modelo ejecutandose en el propio telefono.
- Asistentes de voz para pequenos comercios: integrado en un pipeline de reconocimiento de voz a texto seguido de tool calling, permite operar la contabilidad por habla sin enviar datos a la nube.
- Aplicaciones de campo sin conectividad: al ejecutarse sobre llama.cpp con un modelo cuantizado Q4_K_M, encaja en escenarios de obra, almacen o mercado donde no hay red.
- Prototipado de agentes de dominio estrecho: sirve como referencia de como un LoRA de 46 MB y rango 16 puede especializar un modelo pequeno en un vocabulario sectorial concreto.
- Investigacion sobre ajuste ligero: util para estudiar la relacion entre ejemplos sinteticos (~3.700), rango del adaptador y precision en seleccion de herramientas.
- Despliegue en hardware movil de gama media: el caso reportado sobre un Samsung A35 sirve de referencia para validar latencia y viabilidad en telefonos Android convencionales.

## Benchmarks y rendimiento

| Prueba | Modelo base | Con Ulak LoRA | Contexto |
|---|---|---|---|
| Test de agente de 207 frases (seleccion correcta de herramienta) | 157/185 | 180/185 | Samsung A35 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es el test interno de agente descrito en la model card.

## Requisitos de hardware

- VRAM: no disponible de forma explicita; el adaptador anade 46 MB sobre el modelo base cuantizado Q4_K_M.
- GPU recomendadas: no especificadas. El escenario declarado es un telefono Android (Samsung A35) con ejecucion por CPU.
- Cabe en GPU de consumo: previsiblemente si, al tratarse de un modelo base E2B cuantizado a Q4_K_M, aunque no se aportan mediciones.
- Opciones de despliegue: llama.cpp con soporte de adaptadores LoRA en GGUF; el modelo base se obtiene de unsloth/gemma-4-E2B-it-GGUF (Q4_K_M).
- Latencia y throughput: no disponibles; solo se reporta el resultado de precision del test de agente en el dispositivo citado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ulak LoRA (este) | 24.158.208 (adaptador) | no disponible | Tool calling en turco coloquial sobre Gemma 4 E2B | Gemma | Hugging Face, GGUF |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base generalista | Gemma | Hugging Face |
| unsloth/gemma-4-E2B-it-GGUF | no disponible | no disponible | Cuantizacion Q4_K_M del modelo base | Gemma | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere el modelo base google/gemma-4-E2B-it y su cuantizacion Q4_K_M para funcionar.
- Dominio muy restringido: entrenado para el vocabulario y las herramientas de la app Ulak; el rendimiento fuera de ese contexto no esta evaluado.
- Idioma limitado al turco; no se declaran capacidades en castellano ni en otros idiomas.
- Entrenamiento con una sola epoca y datos sinteticos: riesgo de sobreajuste al estilo de las frases generadas y de menor robustez ante variaciones reales.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- La licencia Gemma impone las Gemma Terms of Use, con condiciones especificas para uso comercial y redistribucion; es necesario revisarlas antes de integrarlo en un producto.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta): madurez y soporte limitados.
- El unico dato de rendimiento procede de un test interno del autor, sin protocolo publico ni comparacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/an80x86/ulak-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Cuantizacion GGUF del modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
