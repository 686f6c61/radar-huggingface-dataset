# KeelCore/KeelCore-750M-Concise

## Resumen

KeelCore-750M-Concise es un adaptador LoRA de rango 16 desarrollado por KeelCore (autor: Saravanan A R) sobre el modelo base KeelCore-750M, un encoder-decoder de 750 millones de parámetros. Su función es concreta y acotada: reescribir texto en inglés para eliminar relleno, muletillas y circunloquios, manteniendo los hechos, nombres, enlaces y cifras. No es un modelo conversacional ni un resumidor; es una herramienta de edición que comprime la expresión sin eliminar puntos del contenido.

El adaptador contiene 18,29 millones de parámetros entrenables (2,43% del base) y ocupa 73 MB, por lo que requiere el modelo base congelado para funcionar. La arquitectura encoder-decoder del base permite leer el texto completo antes de generar, lo que facilita la copia literal de entidades como URLs o números de teléfono. Según la model card, en el conjunto de validación las salidas son un 20% más cortas de media y el 97% resultan más breves que la entrada.

Es relevante para escenarios de despliegue en local o en navegador (soporta ONNX Runtime Web) donde el texto no debe salir del dispositivo del usuario, y como caso de estudio de adaptadores pequeños sobre un modelo base compartido. El modelo se publicó a finales de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre encoder-decoder KeelCore-750M |
| Parámetros totales | 750M (base) + 18,29M entrenables en el adaptador (2,43% del base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | KeelCore License, Version 1.0 (license_name: keelcore-license-1.0) |
| Formato de pesos | `adapter.safetensors` + `adapter_config.json` (formato propio KeelCore, no PEFT); soporte ONNX para navegador |

## Arquitectura y entrenamiento

El adaptador se aplica sobre KeelCore-750M, un transformer encoder-decoder de 750 millones de parámetros. La elección de arquitectura encoder-decoder es deliberada: el encoder procesa la entrada completa antes de que el decoder genere, lo que permite copiar literalmente nombres, URLs y otros textos exactos en la salida. El adaptador es un LoRA de rango 16 con 18,29 millones de parámetros entrenables, empaquetado en un fichero de 73 MB.

La tarea de entrenamiento es la reescritura para concisión: el modelo recibe texto en inglés y devuelve la misma información con menos palabras. La entrada se envuelve automáticamente con el marco ` <text_to_rewrite> … </text_to_rewrite> </s>` y la salida se limita a 384 tokens nuevos con los ajustes por defecto. El adaptador incluye una verificación de huella (fingerprint) de los pesos del base y rechaza cargarse sobre cualquier modelo distinto de KeelCore-750M. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reescritura de texto en inglés para eliminar relleno, padding y fórmulas verbales redundantes.
- Conservación de hechos, nombres propios, URLs, direcciones de correo y números de teléfono en la salida.
- Compresión media del 20% en longitud, con un 97% de salidas más cortas que la entrada en el conjunto de validación.
- Ejecución en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- Procesamiento local: el texto no necesita abandonar la máquina del usuario.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es un modelo de chat: no responde preguntas ni sigue instrucciones contenidas en el texto.
- No resume documentos largos en puntos; mantiene cada idea y recorta las palabras que la rodean.
- Solo inglés; no hay capacidades multilingües declaradas.

## Casos de uso

- Acortar correos electrónicos y mensajes internos: el adaptador elimina fórmulas como "due to the fact that" o "please be advised that" y devuelve la misma información en menos palabras, adecuado para equipos que redactan comunicaciones frecuentes.
- Limpieza de tickets y notas de soporte: se integra como paso previo al envío o al archivado para reducir ruido en sistemas de gestión de incidencias, manteniendo números de ticket y referencias exactas.
- Edición en el navegador sin salida de datos: al ejecutarse con ONNX Runtime Web, permite ofrecer una función de "acortar texto" en una aplicación web donde el contenido del usuario no debe enviarse a un servidor.
- Preprocesado en pipelines de documentación: compactar descripciones y actualizaciones de estado antes de publicarlas o de pasarlas a otro sistema, reduciendo longitud sin perder entidades.
- Investigación sobre adaptadores pequeños: sirve como punto de partida para estudiar LoRA de bajo rango sobre un base compartido, con un caso de tarea única bien delimitada.
- Herramienta de escritura en dispositivos con recursos limitados: al requerir solo el base de 750M y un adaptador de 73 MB, puede desplegarse en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de la tarea: reducción media del 20% en longitud y un 97% de salidas más cortas que la entrada en el conjunto de validación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un modelo base de 750M en precisión completa requiere del orden de 3 GB, y menos con cuantización, aunque no se documentan los formatos soportados.
- GPU recomendadas: no disponible. El modelo declara ejecución en CPU o GPU con PyTorch.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del base, aunque no se confirma en la documentación.
- Despliegue: PyTorch (CPU/GPU) mediante el repositorio de GitHub de KeelCore, y ONNX Runtime Web para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de reescritura o modelos pequeños de edición de texto) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Puede eliminar detalles necesarios: al recortar palabras, puede suprimir información que el usuario consideraba relevante.
- No apto para texto donde cada palabra o carácter debe conservarse (cláusulas legales, código, configuración, cifras financieras, citas) sin revisión humana.
- Texto ya conciso: en entradas breves y ajustadas, el modelo tiende a devolver el texto sin cambios.
- Solo inglés: no hay soporte para otros idiomas.
- No es un chatbot ni un resumidor: no responde preguntas, no sigue instrucciones del texto y no condensa documentos largos en puntos.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo generativo no puede descartarse la alteración de entidades; la arquitectura encoder-decoder mitiga parcialmente este riesgo al permitir copia literal.
- Restricciones de licencia: KeelCore License 1.0, una licencia "other"; deben revisarse los términos exactos antes de uso comercial.
- Formato propietario: el adaptador no usa el formato PEFT y requiere el código del repositorio de KeelCore, que además verifica la huella del base y rechaza otros modelos.
- Repositorios privados: la model card indica que es necesario `huggingface-cli login` mientras los repositorios sean privados, lo que condiciona el acceso.
- Sin tracción verificable: cero descargas y cero likes en el momento de la ficha, sin benchmarks públicos que respalden las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Concise
- Modelo base: https://huggingface.co/KeelCore/KeelCore-750M
- Informe técnico: https://saravanan-a-r.github.io/KeelCore/
- Repositorio GitHub: https://github.com/saravanan-a-r/KeelCore
- Licencia: https://huggingface.co/KeelCore/KeelCore-750M-Concise/blob/main/LICENSE
- Autor (LinkedIn): https://www.linkedin.com/in/saravanan-a-r/
