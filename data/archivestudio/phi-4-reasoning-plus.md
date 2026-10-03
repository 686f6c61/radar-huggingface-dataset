# ArchiveStudio/Phi-4-reasoning-plus

## Resumen

Phi-4-reasoning-plus es un modelo de razonamiento de pesos abiertos desarrollado por Microsoft Research, obtenido mediante ajuste fino supervisado y aprendizaje por refuerzo a partir de microsoft/phi-4. La ficha que se evalua aqui corresponde al repositorio ArchiveStudio/Phi-4-reasoning-plus, una reproduccion de terceros del modelo original publicado por Microsoft, con licencia MIT y pesos en safetensors.

El modelo conserva la arquitectura del Phi-4 base: un transformer denso decoder-only de 14.659.507.200 parametros (aproximadamente 14B), con una longitud de contexto declarada de 32.000 tokens. Su entrenamiento se centra en dominios de matematicas, ciencia y codigo, e incorpora una fase de RL que incrementa la precision a costa de generar de media un 50 por ciento mas de tokens, lo que se traduce en mayor latencia.

Es relevante porque combina un tamano contenido, apto para entornos con restricciones de memoria o latencia, con un modo de razonamiento explicito: las respuestas se estructuran en un bloque de cadena de pensamiento (CoT) y un bloque de resumen final. Se distribuye bajo licencia MIT, lo que facilita su uso comercial, y el idioma principal soportado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (family phi3 en transformers) |
| Parametros totales | 14.659.507.200 (aproximadamente 14B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens declarados; el autor reporta pruebas con extension hasta 64.000 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en precision completa); no se detallan cuantizaciones propias |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con la misma arquitectura que el Phi-4 previamente publicado, de aproximadamente 14B de parametros. El entrenamiento parte de microsoft/phi-4 y aplica ajuste fino supervisado sobre un conjunto de trazas de cadena de pensamiento, seguido de aprendizaje por refuerzo. El conjunto de datos de ajuste supervisado combina prompts sinteticos con datos filtrados de alta calidad procedentes de sitios de dominio publico, enfocados en matematicas, ciencia y codigo, ademas de datos de alineamiento para seguridad y Responsible AI.

Segun la model card, el entrenamiento se realizo sobre 16.000 millones de tokens (unos 8.300 millones de tokens unicos), utilizando 32 GPU H100-80G durante 2,5 dias, en el periodo comprendido entre enero y abril de 2025. La fase adicional de RL es la que diferencia a la variante "plus" de la variante estandar: aporta mayor precision pero incrementa la longitud de salida en torno a un 50 por ciento. El modelo queda fijado sobre un conjunto de datos offline con fecha de corte en marzo de 2025. La salida se organiza en dos secciones: un bloque de razonamiento (chain-of-thought) seguido de un bloque de resumen.

## Capacidades

- Generacion de texto conversacional en formato chat (plantilla ChatML).
- Razonamiento explicito mediante cadena de pensamiento estructurada en dos bloques (razonamiento y resumen).
- Razonamiento matematico, que la model card senala como el caso de uso para el que el modelo esta disenado y probado.
- Codigo y ciencia, segun la composicion declarada del dataset de entrenamiento.
- Capacidades de logica y razonamiento multi-paso, orientadas a consultas complejas con CoT largo.
- Soporte de tool calling / function calling: no mencionado en la informacion disponible.
- Soporte de agentes: no mencionado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Vision o audio: no disponibles.
- Modo thinking: si, mediante el bloque de razonamiento previo a la respuesta final.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo genera una cadena de razonamiento antes del resultado final, adecuado para tutoria, verificacion de ejercicios o generacion de soluciones explicadas.
- Asistencia en codigo con explicacion: puede razonar sobre un problema de programacion y justificar la solucion, util en entornos de revision y generacion de fragmentos en ingles.
- Razonamiento logico y analisis multi-paso: tareas que requieren descomponer un problema en etapas, aprovechando la CoT larga (hasta 32k tokens de salida en consultas complejas).
- Asistente de investigacion en ciencia y matematicas: apoyo a la exploracion de hipotesis o derivaciones en ingles, con salida estructurada en razonamiento y resumen.
- Entornos con restricciones de memoria o computo: al ser un modelo denso de 14B, puede desplegarse en una unica GPU de gama alta o en configuraciones cuantizadas, segun el escenario.
- Escenarios con requisitos de latencia acotada frente a precision: la variante estandar de Phi-4-reasoning seria preferible cuando la latencia importe, ya que la variante "plus" genera mas tokens.
- Prototipado de aplicaciones generativas sobre licencia permisiva: la licencia MIT facilita integrar el modelo en productos propietarios sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma un rendimiento fuerte en tareas intensivas de razonamiento y menciona que la variante "plus" tiene mayor precision que la variante estandar a cambio de generar un 50 por ciento mas de tokens, pero no aporta cifras numericas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en precision completa (BF16/FP16): aproximadamente 29,3 GB, coherente con los 14.659.507.200 parametros (unos 29,3 GB de pesos).
- VRAM estimada con cuantizacion de 8 bits: en torno a 15 GB.
- VRAM estimada con cuantizacion de 4 bits: en torno a 8-9 GB.
- GPU profesionales: el entrenamiento uso 32 H100-80G; para inferencia cabe comodamente en una A100 40GB o una H100.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en precision completa justo al limite y con holgura en cuantizacion de 8 o 4 bits. En GPUs de 16 GB requeriria cuantizacion agresiva.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado como compatible) y vLLM son las vias coherentes con el formato safetensors. No se confirma en la informacion disponible el soporte de llama.cpp u Ollama en este repositorio concreto.
- Configuracion de inferencia recomendada: temperature=0.8, top_k=50, top_p=0.95, do_sample=True. Para consultas complejas, max_new_tokens=32768.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se sabe que la variante "plus" genera de media un 50 por ciento mas de tokens que la estandar, lo que implica mayor latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| Phi-4-reasoning-plus (este) | 14,7B denso | 32k (hasta 64k en pruebas) | MIT | Razonamiento con RL | no disponible en la informacion |
| microsoft/Phi-4 (base) | 14B denso | 16k | MIT | Proposito general | no comparado en la informacion |
| DeepSeek-R1-Distill-Qwen-14B | 14,7B denso | 128k | MIT | Razonamiento por destilacion | no comparado en la informacion |

Nota: los datos de los modelos comparables se incluyen a titulo orientativo y no se han verificado en la informacion proporcionada; el rendimiento relativo no puede establecerse sin resultados de benchmarks publicados.

## Limitaciones y advertencias

- Este repositorio (ArchiveStudio/Phi-4-reasoning-plus) es una reproduccion de terceros, con 0 descargas y 0 likes en el momento de la consulta; el repositorio de referencia es microsoft/Phi-4-reasoning-plus. Conviene verificar la integridad de los pesos antes de usarlos en produccion.
- La model card indica que el modelo esta disenado y probado unicamente para razonamiento matematico; no se ha evaluado especificamente para todos los casos de uso downstream.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la model card recomienda evaluar y mitigar exactitud, seguridad y equidad antes de usos de alto riesgo.
- Sesgos conocidos: la model card no detalla sesgos especificos, pero remite a las consideraciones de Responsible AI habituales de Microsoft.
- Fecha de corte: marzo de 2025, con datos offline; el modelo no incorpora conocimiento posterior.
- Latencia: la variante "plus" genera aproximadamente un 50 por ciento mas tokens que la estandar, lo que penaliza el coste y el tiempo de respuesta.
- Formato obligatorio: requiere plantilla ChatML con un system prompt concreto para funcionar correctamente ("You are Phi, a language model trained by Microsoft to help users..."), lo que condiciona la integracion.
- Licencia MIT: permisiva y apta para uso comercial, sin obligaciones de copyleft, pero sujeta a las leyes aplicables (privacidad, cumplimiento comercial) que el desarrollador deba respetar.

## Enlaces

- Repositorio evaluado en HuggingFace: https://huggingface.co/ArchiveStudio/Phi-4-reasoning-plus
- Informe tecnico (paper, arXiv 2504.21318): https://huggingface.co/papers/2504.21318
- Licencia referenciada en la model card: https://huggingface.co/microsoft/Phi-4-reasoning-plus/resolve/main/LICENSE
- Modelo base: https://huggingface.co/microsoft/phi-4
