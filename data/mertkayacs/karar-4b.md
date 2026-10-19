# mertkayacs/Karar-4B

## Resumen

Karar-4B es un modelo de 4B parámetros especializado en clasificación de texto y toma de decisiones con probabilidades calibradas, desarrollado por Eschatia Labs y publicado por Mert Kaya en Hugging Face. Parte de `internlm/Intern-Decision-4B` y está orientado a enviar una situación, una pregunta y un conjunto de opciones para obtener una probabilidad por cada opción, con posibilidad de abstención mediante una categoría `unknown`.

El modelo resuelve un problema concreto: enrutamiento, triaje y decisiones cerradas en turco con incertidumbre explícita, algo poco habitual en modelos pequeños. El autor reporta un 96,8 % de exactitud en decisiones turcas held-out frente al 87,1 % de Kev-4B, y un Brier score de 0,058 frente a 0,214. También declara una menor sensibilidad a instrucciones plantadas: 19,0 % de cambios frente al 36,0 % de Kev-4B.

Su relevancia práctica está en que la versión GGUF Q4_K_M ocupa 2,71 GB y alcanza un pico de 3,03 GB de RAM con contexto de 4k, por lo que puede ejecutarse en local y en dispositivos con recursos limitados. La model card insiste en que las instrucciones y los ejemplos deben escribirse en turco; los idiomas declarados son turco e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; fine-tune de `internlm/Intern-Decision-4B`. La etiqueta de Hugging Face indica `qwen3_5`, pero la model card no detalla la arquitectura interna ni confirma si es dense o MoE |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Longitud de contexto | No disponible; el ejemplo local documentado usa 4k de contexto |
| Tipos de cuantización | GGUF Q4_K_M (2,71 GB); pesos completos en safetensors. No se listan otras cuantizaciones |
| Idiomas soportados | Turco (`tr`) e inglés (`en`); las instrucciones y ejemplos de decisión están en turco |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en el repositorio principal; GGUF en `mertkayacs/Karar-4B-GGUF` |
| Modelo base | `internlm/Intern-Decision-4B` |
| Pipeline declarado | `text-classification` |

## Arquitectura y entrenamiento

Karar-4B es un fine-tune del modelo `internlm/Intern-Decision-4B`. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica si la arquitectura interna es dense o MoE; no se declaran parámetros activos, por lo que no hay evidencia de que sea un modelo MoE. La etiqueta `qwen3_5` aparece en Hugging Face, pero no se desarrolla en la información disponible.

El modelo conserva un formato de “decision-token” y un sistema de calibración para devolver probabilidades por opción. Las etiquetas del repositorio incluyen `calibration` y `conformal-prediction`, aunque el procedimiento concreto de calibración conforme no se detalla. El entrenamiento usa el dataset `mertkayacs/jevalt-data`; el conjunto de test procede de la misma pipeline de datos que el entrenamiento, un caveat importante para interpretar la exactitud del 96,8 %. El autor también reporta un 19,0 % de cambios de decisión ante instrucciones plantadas, frente al 36,0 % de Kev-4B.

## Capacidades

- Clasificación de texto en un conjunto cerrado de opciones, devolviendo una probabilidad calibrada por cada opción.
- Preguntas de elección (`choice`), preguntas de sí/no, puntuaciones ordenadas y opción `unknown` con `abstain: true`.
- Enrutamiento y triaje: asignación de tickets, incidencias, leads o correos a una categoría predefinida.
- Modo de razonamiento configurable: con `reasoning: "on"` escribe una breve justificación en turco antes de decidir; con `reasoning: "off"` responde directamente.
- Capacidad multilingüe limitada a turco e inglés, con instrucciones y ejemplos principales en turco.
- Uso local y on-device mediante GGUF, Ollama, llama.cpp o el servidor JevAlt.
- No se documentan tool calling, function calling, agentes multi-paso, visión ni audio. Aunque las etiquetas de Hugging Face incluyen `image-text-to-text`, la model card y los ejemplos son exclusivamente de texto.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y las categorías disponibles, y devuelve probabilidades para facturación, soporte técnico, ventas o cuenta. Es adecuado porque permite aplicar umbrales y derivar a revisión humana cuando la probabilidad máxima es baja.
- Triaje de incidencias: clasificación de una incidencia como crítica, alta o baja usando la etiqueta y la probabilidad asociada. El ejemplo registrado de caída de checkout devuelve “Kritik” con 83,7 %, lo que permite priorizar colas de atención.
- Cualificación de leads comerciales: clasificación de un contacto como caliente, tibio o frío antes de asignarlo a un comercial. El ejemplo registrado de lead cualificado devuelve “Sıcak” con 91,0 %.
- Validación de devoluciones y garantías: respuesta sí/no a preguntas como si un pedido está dentro del plazo de devolución de 14 días. El ejemplo registrado devuelve “Hayır” con 97,0 %, útil para automatizar la primera validación.
- Filtrado y cuarentena de correo sospechoso: clasificación de correos con instrucciones plantadas o indicios de phishing en categorías como cuarentena. El ejemplo registrado devuelve “Karantina” con 84,2 %, aunque no sustituye un motor antiphishing especializado.
- Detección de información incompleta: cuando falta un dato clave, el modelo puede abstenerse y devolver `unknown`. El ejemplo registrado de un mensaje de hotel sin el detalle de la reserva devuelve “bilinmiyor” con 96,6 %, lo que evita una decisión forzada.
- Asistencia a decisiones en escenarios de emergencia: clasificación de la acción recomendada ante un incidente, con probabilidad asociada y posibilidad de derivar a un operador humano. El ejemplo registrado de un incendio en un granero devuelve “Yangını söndürmeye yardım et” con 64,0 %, una confianza moderada que exige revisión humana.
- Clasificación local de textos sensibles: ejecución en local con Q4_K_M para procesar tickets, correos o formularios sin enviar datos a la nube, usando el servidor JevAlt o llama.cpp.

## Benchmarks y rendimiento

| Modelo | Exactitud en decisiones turcas held-out | Brier score | Cambios por instrucción plantada | Prueba en vivo |
|---|---:|---:|---:|---:|
| Karar-4B | 96,8 % | 0,058 | 19,0 % | 113/130 (4 de octubre de 2026) |
| Kev-4B | 87,1 % | 0,214 | 36,0 % | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la información disponible. La comparación publicada se centra en exactitud de decisiones, calibración y robustez a instrucciones plantadas. El propio autor indica que el conjunto de test procede de la misma pipeline que el entrenamiento, por lo que la exactitud held-out no debe interpretarse como una medida de generalización fuera de distribución.

## Requisitos de hardware

- GGUF Q4_K_M: archivo de 2,71 GB y pico de RAM de 3,03 GB con contexto de 4k, según la model card.
- Pesos completos: el repositorio principal ocupa 9,4 GB; la inferencia con safetensors requiere al menos ese espacio más el overhead del backend. No hay una cifra oficial de VRAM para pesos completos.
- VRAM estimada para Q4_K_M: no hay requisito oficial de VRAM. Como referencia, los pesos ocupan 2,71 GB y el pico medido en RAM es de 3,03 GB a 4k; en GPU hay que sumar KV cache y overhead del backend.
- GPU recomendadas: no hay una lista oficial del autor. Por huella de memoria, Q4_K_M es apto para tarjetas consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB; también puede ejecutarse en CPU. Para pesos completos es prudente una GPU de 16-24 GB o más. Son estimaciones por tamaño, no validaciones publicadas.
- A100 y H100 pueden ejecutar el modelo, pero no son necesarias para Q4_K_M y no se ha publicado throughput para estos aceleradores.
- Despliegue documentado: llama.cpp mediante el servidor JevAlt, Ollama (`ollama run mertkayacs/karar-4b`) y backend Transformers de JevAlt para pesos completos.
- vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Karar-4B | 4,54 B | No disponible; prueba local a 4k | 96,8 % de exactitud; Brier 0,058; 19,0 % de cambios por instrucción plantada | Apache-2.0 | Hugging Face con safetensors, GGUF y Ollama |
| Kev-4B | No disponible; el nombre sugiere 4B, sin confirmar | No disponible | 87,1 % de exactitud; Brier 0,214; 36,0 % de cambios por instrucción plantada | No disponible | No disponible en la información proporcionada |
| Intern-Decision-4B | No disponible; el nombre sugiere 4B, sin confirmar | No disponible | No disponible | No disponible | Hugging Face como modelo base |

La única comparación cuantitativa publicada es con Kev-4B. No hay datos suficientes para comparar con modelos turcos de clasificación de otros proveedores, ni con modelos generativos del mismo tamaño en MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- El benchmark principal procede de la misma pipeline de datos que el entrenamiento. La exactitud del 96,8 % no equivale a un test independiente ni a generalización fuera de distribución.
- La prueba en vivo reportada es de 113/130, inferior a la exactitud held-out, lo que refuerza la necesidad de validar con datos propios.
- El modelo está centrado en turco. Aunque declara inglés, las instrucciones y ejemplos documentados están en turco; el rendimiento en inglés no está cuantificado.
- No se documentan sesgos conocidos. Al ser un modelo entrenado para decisiones cerradas en turco, puede heredar sesgos culturales, léxicos o de anotación del dataset `mertkayacs/jevalt-data`.
- Riesgo de sobreconfianza fuera de distribución: las probabilidades calibradas pueden no ser fiables ante dominios, jergas o idiomas distintos de los de entrenamiento.
- El 19,0 % de cambios ante instrucciones plantadas sigue siendo relevante para aplicaciones expuestas a prompt injection; no debe usarse como único filtro de seguridad.
- Las probabilidades calibradas requieren el servidor JevAlt o el backend que preserve el formato de decisión. Ollama responde con la letra de la opción; la capa de calibración la añade JevAlt.
- No se documentan tool calling, agentes multi-paso, visión ni audio. La etiqueta `image-text-to-text` no está respaldada por ejemplos o documentación en la model card.
- La longitud máxima de contexto no está publicada; el único dato operativo es el ejemplo con 4k de contexto.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base `internlm/Intern-Decision-4B` y del dataset de entrenamiento antes de un despliegue en producción.
- No debe utilizarse como única autoridad en decisiones médicas, legales, financieras o de seguridad. En esos casos es necesario un humano en el circuito y umbrales de abstención conservadores.

## Enlaces

- [Modelo Karar-4B en Hugging Face](https://huggingface.co/mertkayacs/Karar-4B)
- [Página del proyecto Karar-4B](https://jevalt.mertkayacs.com/models/karar-4b/)
- [Repositorio JevAlt en GitHub](https://github.com/mertkayacs/jevalt)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/mertkayacs/JevAlt)
- [Builds GGUF de Karar-4B](https://huggingface.co/mertkayacs/Karar-4B-GGUF)
- [Dataset de entrenamiento jevalt-data](https://huggingface.co/datasets/mertkayacs/jevalt-data)
- [Resultados de benchmark jevalt-bench](https://huggingface.co/datasets/mertkayacs/jevalt-bench)
- [Evaluador JevOss](https://github.com/mertkayacs/jevoss)
- [Página de benchmarks de Eschatia Labs](https://eschatialabs.com/benchmarks/jevalt-bench/)
- [Karar-4B en Ollama](https://ollama.com/mertkayacs/karar-4b)
- [Colección JevAlt decision models](https://huggingface.co/collections/mertkayacs/jevalt-decision-models)
- [Colección Turkish and German AI models](https://huggingface.co/collections/mertkayacs/turkish-and-german-ai-models)
