# FigaAI/RuCover-Lite-Mini-Think_Edition

## Resumen

RUcover Lite Mini — THINK Edition es un modelo de lenguaje pequeño (SLM) de aproximadamente 10 millones de parámetros, desarrollado por FigaAI, especializado en ruso y orientado a tareas de razonamiento lógico paso a paso. Se basa en una arquitectura Transformer Decoder con 6 capas, 384 unidades ocultas y 6 cabezas de atención, con una ventana de contexto de 1024 tokens y un vocabulario BPE de 32 000 entradas que cubre ruso, inglés y código.

El modelo se distingue por su mecanismo de "Reasoning Alignment", que fuerza la generación de una cadena de pensamiento explícita entre las etiquetas `thinking... response` antes de ofrecer la respuesta final. Este comportamiento se consigue mediante un pipeline de entrenamiento en tres etapas: pre-entrenamiento con 4,3 GB de texto (datasets RLDD, Lenta y Arzamas), alineación de identidad con 1518 instrucciones y ajuste fino de razonamiento sobre un destilado de DeepSeek-R1 (Qwen-32B).

Su relevancia radica en ofrecer una alternativa extremadamente ligera (unos 500 MB de RAM/VRAM) para entornos con recursos limitados, capaz de ejecutarse en CPU a 40–60 tokens por segundo y superar los 200 tokens por segundo en GPU. Es una opción práctica para prototipos, educación y aplicaciones de bajo coste donde se prioriza la eficiencia sobre la capacidad bruta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Decoder (6 capas, 384 hidden, 6 heads) |
| Parametros totales | ~10 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (principal), ingles y codigo (vocabulario BPE) |
| Licencia | MIT |
| Formato de pesos | model.pt (PyTorch) y tokenizador rucover_tokenizer.json |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer Decoder autoregresiva estándar, sin indicios de innovaciones adicionales como RoPE, RMSNorm o SwiGLU (aunque el modelo hermano RUcover-Lite-Mini-v1 sí las incorpora, no se confirma para esta edición). El entrenamiento sigue un pipeline de tres fases: pre-entrenamiento durante 500 000 pasos sobre 4,3 GB de texto en ruso procedente de los datasets RLDD, Lenta y Arzamas; alineación de identidad con 1518 instrucciones para establecer el comportamiento de chat; y ajuste fino de razonamiento utilizando un destilado de DeepSeek-R1 (basado en Qwen-32B), que enseña al modelo a emitir cadenas de pensamiento antes de responder.

La característica distintiva es el modo "Think", que obliga a generar una secuencia de razonamiento entre las etiquetas `thinking` y `response`. Esto permite que el modelo estructure su proceso lógico internamente, mejorando la coherencia en tareas de deducción, aunque con el coste de una mayor latencia por la generación de tokens adicionales. El vocabulario BPE de 32 000 entradas incluye tokens para ruso, inglés y código, lo que facilita tareas de programación básica.

## Capacidades

- Generacion de texto en ruso con razonamiento paso a paso mediante etiquetas `thinking` y `response`.
- Censura integrada para bloquear prompts destructivos o perjudiciales.
- Soporte básico de codigo gracias a la inclusion de tokens de codigo en el vocabulario.
- Capacidad multilingue limitada a ruso e ingles (el ruso es el idioma principal).
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta entradas multimodales (solo texto).
- Rendimiento optimizado para entornos de bajos recursos: 40–60 tokens/seg en CPU y 200+ tokens/seg en GPU.
- Consumo de memoria reducido: aproximadamente 500 MB de RAM o VRAM.

## Casos de uso

- Chatbots educativos en ruso: el modelo puede mantener conversaciones sencillas sobre temas de logica, matematicas basicas o lengua rusa, generando explicaciones razonadas gracias a su modo Think.
- Asistente de razonamiento para estudiantes: su capacidad de emitir cadenas de pensamiento permite descomponer problemas de deduccion o algebra elemental en pasos intermedios, util como herramienta de apoyo didactico.
- Generacion de texto creativo en ruso: cuentos cortos, poemas o parrafos descriptivos, aprovechando su vocabulario de 32 000 tokens y su entrenamiento sobre corpus literarios como Arzamas.
- Prototipado rapido de aplicaciones de NLP en ruso: al ser ligero y ejecutable en CPU, es ideal para validar ideas en entornos de desarrollo sin GPU, por ejemplo en Raspberry Pi o servicios serverless.
- Ejercicios de programacion basica: aunque no soporta tool calling, puede generar fragmentos de codigo sencillos en Python o pseudocodigo, y explicar su logica paso a paso.
- Filtrado y clasificacion de texto en ruso: gracias a su bajo coste computacional, puede emplearse para tareas de etiquetado o resumen de textos cortos en pipelines de preprocesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 500 MB, tanto en RAM como en VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060 o superiores). Tambien funciona en CPU sin GPU.
- Compatible con consumer GPU: si, incluyendo tarjetas de gama baja.
- Opciones de despliegue: el README proporciona un script `test_think.py` que carga `model.pt` y el tokenizador con PyTorch. No se mencionan integraciones con vLLM, Ollama o llama.cpp, pero al ser un modelo PyTorch estandar podria adaptarse.
- Latencia y throughput: 40–60 tokens/seg en CPU, 200+ tokens/seg en GPU, con un consumo de memoria de unos 500 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RUcover Lite Mini THINK Edition | ~10M | 1024 | ru, en, codigo | MIT | Razonamiento forzado con tags |
| RUcover Lite Mini v1 | ~10M | no disponible | ru | MIT | Version base sin modo Think, con RoPE, RMSNorm, SwiGLU |
| Otros SLM en ruso | no disponible | no disponible | ru | no disponible | Sin datos publicados en la informacion disponible |

La comparativa se limita al modelo hermano v1, ya que no se dispone de datos de otros modelos de tamano similar en ruso. La principal diferencia entre ambas versiones es el mecanismo de razonamiento forzado y el ajuste fino con destilado de DeepSeek-R1 en la edicion Think.

## Limitaciones y advertencias

- Contexto muy limitado: solo 1024 tokens, insuficiente para dialogos largos o documentos extensos.
- Modelo extremadamente pequeno (~10M parametros): su capacidad de comprension y generacion es muy inferior a la de modelos de miles de millones de parametros; puede producir respuestas incoherentes o con errores logicos.
- Riesgo de alucinacion: al ser un SLM, es propenso a inventar datos o hechos cuando se le pregunta sobre temas fuera de su corpus de entrenamiento.
- Idioma principal ruso: aunque el vocabulario incluye ingles y codigo, el rendimiento en estos idiomas es limitado y no se garantiza.
- Censura integrada: el modelo incluye filtros de seguridad que pueden bloquear ciertos prompts, lo que podria limitar su uso en aplicaciones que requieran contenido abierto.
- Sin capacidades avanzadas: no soporta tool calling, funciones de agente, vision ni audio.
- Licencia MIT: permite uso comercial, pero sin garantias de soporte ni responsabilidad por parte del autor.
- Fecha de creacion futura (2026): el modelo es muy reciente y no hay evidencia de adopcion ni benchmarks publicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/FigaAI/RuCover-Lite-Mini-Think_Edition)
- [Perfil de FigaAI en Hugging Face](https://huggingface.co/FigaAI/models)
- [Modelo hermano RUcover-Lite-Mini-v1](https://huggingface.co/FigaAI/RUcover-Lite-Mini-v1)
