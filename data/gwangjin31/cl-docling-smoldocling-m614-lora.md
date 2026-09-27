# gwangjin31/cl-docling-smoldocling-m614-lora

## Resumen

Este artefacto es un adaptador LoRA de tipo PEFT publicado por el usuario `gwangjin31` sobre el modelo vision-lenguaje `docling-project/SmolDocling-256M-preview`, fijado a la revisión inmutable `ce51f56c4ebe36e0b1c3a55f67b261ba22a50bf8`. SmolDocling es un modelo de 256M parámetros orientado a la conversión de imágenes de páginas de documentos a DocTags (una representación estructurada intermedia, no Markdown final), construido sobre la arquitectura Idefics3 (`Idefics3ForConditionalGeneration`), tal y como refleja el ejemplo de uso de la model card.

La particularidad del proyecto no es el rendimiento del adaptador, sino el recorrido de ingeniería que demuestra: cargar pesos de Hugging Face en Common Lisp, entrenar el LoRA de forma nativa con `cl-docling` y `cl-transformer-blocks` sobre Apple MLX, exportar un adaptador PEFT estándar de 120 tensores y verificar que Transformers 5.16.1 y PEFT 0.20.0 los cargan exactamente, reproduciendo 23 salidas nativas retenidas (11.458 token IDs exactos). Python se utilizó únicamente como procesador y oráculo independiente de generación, no como alternativa de entrenamiento.

El autor es explícito sobre el alcance: el adaptador no mejora de forma general la conversión de PDF. En nueve páginas protegidas la aceptación exacta de página se mantuvo en 0/9 y la mejora se limitó a dos ediciones de carácter y una de palabra frente a la base. Se trata, por tanto, de un artefacto de investigación reproducible, no de una solución de OCR de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-lenguaje Idefics3 (base `SmolDocling-256M-preview`) |
| Parametros totales | Modelo base: 256M (segun denominacion del modelo base). Adaptador: no disponible (LoRA de rango 2, 120 tensores exportados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; en pruebas, dos paginas densas alcanzaron el limite de 2.048 tokens de generacion |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y el entrenamiento se hizo en FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | cdla-permissive-2.0 (heredada de la model card del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); `library_name: peft` |
| Tamano del repositorio | 0.0 GB |
| Pipeline | image-text-to-text |
| Revision base fijada | `ce51f56c4ebe36e0b1c3a55f67b261ba22a50bf8` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre las proyecciones `q_proj` y `v_proj` de la autoatención del decodificador, con rango 2, alpha 4 y dropout cero. La torre de visión, el conector y el decodificador base permanecen congelados. El entrenamiento se realizó de forma nativa en Common Lisp sobre Apple MLX, con dos pasadas fijas sobre ocho páginas, 16 actualizaciones de AdamW en FP32 y backend Metal. La selección del punto de control se hizo comparando base, paso 8 y paso 16 únicamente sobre el conjunto de validación, resultando elegido el paso 16.

Los datos de entrenamiento consisten en ocho páginas con respaldo de fuente procedentes de cuatro libros de dominio público de Internet Archive, con siete páginas de validación de otros tres libros y nueve páginas protegidas de tres libros adicionales que solo se abrieron tras la selección. La selección de URL y páginas se apoyó en los metadatos de `allenai/olmOCR-mix-0225`, sin leer nunca su campo de respuesta o etiqueta débil. Los objetivos eran DocTags revisados manualmente a partir de renders de origen. Se trata, por tanto, de un ajuste de muy pocos ejemplos, orientado a demostrar el circuito completo (Hugging Face → Common Lisp → entrenamiento nativo → PEFT estándar → Python ordinario) más que a una mejora de generalización.

## Capacidades

- Generación de DocTags a partir de una imagen RGB de página, con la instrucción textual `Convert this page to docling.`
- Procesamiento de imágenes de documentos en pipeline `image-text-to-text`.
- Emisión de estructura intermedia DocTags; el parseo y la exportación estricta a Markdown quedan a cargo del consumidor.
- Reproducción determinista de salidas: 23 salidas nativas retenidas reproducidas con 11.458 token IDs exactos, texto decodificado en crudo y motivos de parada.
- Carga y ejecución de pesos de Hugging Face en Common Lisp sin inferencia Python oculta en la API nativa.
- Exportación de un adaptador PEFT estándar, cargable por Transformers y PEFT.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión general fuera de documentos, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Investigación en interoperabilidad de ecosistemas: sirve para estudiar cómo cargar y entrenar pesos de Hugging Face íntegramente en Common Lisp sobre MLX, con verificación de ida y vuelta contra el ecosistema Python.
- Reproducibilidad de artefactos PEFT: al incluir `cl_docling_release.json` con revisión base inmutable, hash del factor, hashes de evidencias y mediciones agregadas, es un caso de estudio para auditar publicaciones de adaptadores.
- Validación de exportación de tensores: útil para comprobar que una implementación no Python exporta adaptadores LoRA que Transformers y PEFT cargan tensor a tensor sin discrepancias.
- Prototipado de extracción de estructura documental en inglés: permite experimentar con DocTags sobre páginas concretas antes de decidir si se adopta el modelo base SmolDocling en un pipeline mayor.
- Docencia de ajuste fino con recursos mínimos: el entrenamiento cabe en un solo equipo Apple Silicon y usa un conjunto de ocho páginas, lo que lo hace adecuado como ejemplo didáctico de LoRA sobre modelos vision-lenguaje.
- Pruebas de tolerancia de flujo en entornos Common Lisp: integración de un modelo multimodal en una base de código Lisp existente como `cl-docling`, sin depender de servicios Python en tiempo de ejecución.
- Comparación de protocolos de evaluación: su conjunto protegido de nueve páginas y sus métricas de edición de caracteres y palabras permiten replicar una metodología de puerta de promoción congelada.
- Despliegue en el borde con modelos de 256M: al ser un adaptador sobre un modelo muy pequeño, sirve para explorar inferencia de conversión de documentos en hardware limitado, siempre que no se exija exactitud de página.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al conjunto protegido de nueve páginas finales, comparando base y adaptador.

| Metrica protegida final | Base | Adaptador |
|---|---:|---:|
| Ediciones de caracter / 16.465 caracteres de referencia | 5.252 | 5.250 |
| Ediciones de palabra / 2.728 palabras de referencia | 869 | 868 |
| Paginas exactas | 0/9 | 0/9 |
| Estructura exacta | 2/9 | 2/9 |
| Exportaciones estrictas | 7/9 | 7/9 |

Además, cinco páginas de regresión con PDF real y nueve páginas sintéticas de cobertura quedaron sin cambios, y dos páginas finales densas alcanzaron el mismo límite de 2.048 tokens antes y después del entrenamiento. En cuanto a la verificación de artefacto, se reprodujeron 23 salidas nativas retenidas con 11.458 token IDs exactos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El modelo base tiene 256M parámetros, por lo que los pesos en FP32 ocupan del orden de 1 GB y en FP16/BF16 alrededor de 0,5 GB; con activaciones y el procesador de imagen, una estimación razonable de VRAM es de 2 a 4 GB (cálculo derivado del tamaño declarado, no una cifra oficial).
- Entrenamiento del adaptador: realizado en FP32 sobre Apple MLX con backend Metal, es decir, en hardware Apple Silicon, sin GPU dedicada.
- Inferencia en GPU de consumo: sí cabe; el ejemplo de la model card usa `dtype=torch.float32` y `attn_implementation="eager"`, lo que permite ejecutarlo en tarjetas tipo RTX 3060/4060 en adelante.
- GPU de centro de datos (A100, H100): no son necesarias para este tamaño; no hay datos publicados de latencia ni throughput en esas plataformas.
- Opciones de despliegue documentadas: Transformers + PEFT en Python y carga nativa en Common Lisp mediante enlace verificado a una base local. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cl-docling-smoldocling-m614-lora | Adaptador LoRA sobre base de 256M; rango 2 | no disponible | 0/9 paginas exactas; 2/9 estructura exacta; 7/9 exportaciones estrictas | cdla-permissive-2.0 | Hugging Face, 0 descargas |
| docling-project/SmolDocling-256M-preview | 256M | no disponible | 0/9 paginas exactas; 2/9 estructura exacta; 7/9 exportaciones estrictas (mismas pruebas) | cdla-permissive-2.0 | Hugging Face, modelo base de referencia |
| Otros conversores de documentos de la misma categoria (por ejemplo, modelos tipo OCR de pagina completa) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |

La comparación directa solo es posible frente al modelo base, porque es el único para el que la información proporcionada incluye métricas sobre el mismo conjunto protegido. Las alternativas de la categoría no se detallan aquí por falta de datos verificables en la fuente.

## Limitaciones y advertencias

- El propio autor advierte de que no es un conversor de PDF mejorado de forma general: en las nueve páginas protegidas la aceptación exacta fue 0/9 tanto antes como después.
- La mejora sobre la base se limita a dos ediciones de carácter y una de palabra, un margen mínimo que no justifica presentarlo como mejora sustancial.
- No debe presentarse como OCR de producción, como generalización documental amplia ni como evidencia de que el ajuste fino suele mejorar SmolDocling.
- El entrenamiento se hizo con ocho páginas de cuatro libros, lo que implica un riesgo alto de sobreajuste y de escasa transferencia a dominios, idiomas o maquetas distintas.
- El adaptador emite DocTags, no Markdown final; el parseo estricto y la exportación son responsabilidad del usuario.
- Dos páginas densas alcanzaron el límite de 2.048 tokens antes y después del entrenamiento, lo que apunta a truncamiento en documentos con mucha densidad de contenido.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no evaluado explícitamente en la información disponible, pero es un caveat relevante en cualquier modelo generativo de documentos.
- Sesgos conocidos: no disponibles.
- Licencia: el adaptador sigue la licencia `cdla-permissive-2.0` de la model card base; conviene revisar la model card y la licencia del modelo base fijado antes de redistribuir o desplegar.
- Procedencia de datos: las páginas se seleccionaron a partir de metadatos de elegibilidad de dominio público registrados por el proyecto, lo que el autor aclara que no constituye una garantía universal de derechos.
- Frontera de reproducibilidad: el paquete de publicación incluye hashes y mediciones, pero la subida al Hub y una descarga remota limpia son puertas de publicación separadas; durante la fase M7.1 no se realizó ninguna subida al Hub.
- El repositorio de origen conserva los protocolos congelados y los fallos, pero no publica las transcripciones de página revisadas, lo que dificulta una reproducción completa por terceros.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Página de Hugging Face del adaptador: https://huggingface.co/gwangjin31/cl-docling-smoldocling-m614-lora
- Modelo base SmolDocling-256M-preview: https://huggingface.co/docling-project/SmolDocling-256M-preview
- Repositorio cl-docling: https://github.com/gwangjinkim/cl-docling
- Repositorio cl-transformer-blocks: https://github.com/gwangjinkim/cl-transformer-blocks
- Conjunto de datos de descubrimiento olmOCR-mix-0225: https://huggingface.co/datasets/allenai/olmOCR-mix-0225
