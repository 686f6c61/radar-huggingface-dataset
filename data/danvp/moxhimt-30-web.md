# DanVP/MoxhiMT-30-web

## Resumen

MoxhiMT-30 Web es un paquete de distribución para Transformers.js y ONNX Runtime Web que permite ejecutar el modelo de traducción MoxhiMT-30 (chino a vietnamita) directamente en el navegador, sin necesidad de servidor backend. El autor, DanVP, ha generado este repositorio a partir de un proceso de exportación de un modelo Marian, optimizado para su uso en entornos web con WebAssembly o WebGPU.

El modelo resuelve el problema de la traducción automática chino-vietnamita en aplicaciones client-side, lo que reduce latencia y costes de infraestructura al eliminar llamadas a APIs externas. Su relevancia actual radica en la creciente demanda de herramientas de traducción privadas y sin conexión, especialmente en contextos donde la privacidad de los datos es crítica. El repositorio ocupa 0,4 GB e incluye pesos en formato ONNX, listos para cargar con la librería `@huggingface/transformers`.

Aunque la información pública es limitada, el paquete está diseñado para ser usado con `dtype: 'q8'` en entornos WebAssembly y `dtype: 'fp16'` en navegadores con soporte WebGPU, lo que sugiere una optimización para diferentes capacidades de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (basada en transformer, segun la etiqueta `marian`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (recomendado para wasm), fp16 (para WebGPU) |
| Idiomas soportados | chino (origen) y vietnamita (destino) |
| Licencia | no disponible |
| Formato de pesos | ONNX (safetensors no confirmado, el repo usa ONNX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un framework de traducción automática neuronal basado en transformer, ampliamente utilizado para modelos de secuencia a secuencia. Sin embargo, no se dispone de detalles sobre el número de capas, dimensiones ocultas, cabezas de atención ni el tamaño del vocabulario. El proceso de entrenamiento tampoco está documentado en la información proporcionada: se desconoce el volumen de datos, la composición del corpus (paralelo chino-vietnamita) y si se aplicaron técnicas como RLHF o DPO. El repositorio actual es un artefacto de exportación, generado mediante un script PowerShell (`export_moxhimt30_transformersjs.ps1`), que convierte los pesos originales a formato ONNX para su uso con Transformers.js.

La innovación técnica principal no reside en el modelo en sí, sino en su empaquetado para ejecución en navegador, aprovechando WebAssembly para CPU y WebGPU para aceleración por GPU. Esto permite inferencia local sin dependencias de servidor, con opciones de cuantización para ajustar el equilibrio entre rendimiento y precisión.

## Capacidades

- Traducción automática de chino a vietnamita, con pipeline `translation` de Transformers.js.
- Ejecución completamente en el navegador, sin necesidad de backend ni conexión a internet tras la carga inicial.
- Soporte para dos modos de inferencia: WebAssembly con cuantización q8 (compatible con la mayoría de navegadores) y WebGPU con fp16 (para navegadores con aceleración gráfica).
- Integración sencilla con la API `pipeline` de `@huggingface/transformers`, lo que facilita su uso en aplicaciones JavaScript/TypeScript.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. El modelo es exclusivamente de traducción.

## Casos de uso

- Traducción en aplicaciones web de atención al cliente: un chat en línea puede traducir mensajes de clientes chinos a vietnamita en tiempo real, manteniendo la conversación dentro del navegador del agente sin enviar datos a servidores externos.
- Herramientas de productividad offline: una extensión de navegador que traduzca páginas web o documentos chinos al vietnamita, funcionando sin conexión una vez cargados los pesos.
- Plataformas de comercio electrónico: traducción automática de descripciones de productos o reseñas de usuarios entre chino y vietnamita, integrada en el frontend para reducir la carga del servidor.
- Aplicaciones educativas: estudiantes de chino o vietnamita pueden usar el modelo para practicar traducción de frases, con la ventaja de que los datos no salen del dispositivo.
- Sistemas de soporte técnico remoto: técnicos que atienden a usuarios en ambos idiomas pueden usar una interfaz web con traducción instantánea, sin depender de APIs de pago.
- Prototipos y demos: desarrolladores pueden integrar rápidamente traducción chino-vietnamita en sus proyectos web usando el pipeline estándar de Transformers.js, ideal para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre BLEU, chrF, METEOR ni comparaciones con otros modelos de traducción chino-vietnamita. Tampoco se especifican métricas de latencia o throughput para los modos wasm o WebGPU.

## Requisitos de hardware

- Al ser un paquete para navegador, no requiere GPU dedicada en el servidor; la inferencia se ejecuta en el dispositivo del usuario.
- Para WebAssembly (dtype q8): funciona en cualquier navegador moderno con soporte WASM; el rendimiento depende de la CPU del dispositivo. Se recomienda al menos 4 GB de RAM para cargar los 0,4 GB de pesos y mantener fluidez.
- Para WebGPU (dtype fp16): requiere un navegador con WebGPU habilitado (Chrome, Edge, Firefox nightly) y una GPU compatible (integrada o dedicada). No se especifican modelos concretos de GPU.
- Opciones de despliegue: exclusivamente client-side mediante Transformers.js. No se mencionan alternativas como vLLM, llama.cpp u Ollama, ya que el formato ONNX y el pipeline están orientados a web.
- Latencia y throughput: no disponibles. Dependerán del hardware del cliente y del tamaño de los textos a traducir.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (traducción chino-vietnamita en navegador). Existen otros modelos Marian en HuggingFace, pero no se han identificado alternativas específicas con las que comparar parámetros, contexto o rendimiento. La información proporcionada no incluye referencias a otros modelos de traducción para esta pareja de idiomas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo, pero al ser un modelo de traducción entrenado con datos no especificados, puede presentar sesgos de género, culturales o de registro lingüístico.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones incorrectas o inventar contenido cuando el texto de origen es ambiguo o contiene errores.
- Limitaciones de contexto: se desconoce la longitud máxima de secuencia soportada; textos muy largos podrían truncarse o degradar la calidad.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si el uso comercial está permitido. Se recomienda contactar al autor antes de usarlo en producción.
- El modelo solo cubre chino y vietnamita; no es multilingüe más allá de esta pareja.
- Al ser un paquete web, el rendimiento en dispositivos de gama baja puede ser insuficiente para traducción en tiempo real, especialmente con el modo wasm.
- No hay garantías de mantenimiento o actualizaciones; el repositorio fue creado en mayo de 2026 y actualizado en agosto de 2026, pero no se indica soporte continuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DanVP/MoxhiMT-30-web
- Árbol de archivos del repositorio: https://huggingface.co/DanVP/MoxhiMT-30-web/tree/main
- Referencia externa (no oficial) sobre el modelo ONNX relacionado: https://free2aitools.com/model/danvp/moxhimt-30-onnx
