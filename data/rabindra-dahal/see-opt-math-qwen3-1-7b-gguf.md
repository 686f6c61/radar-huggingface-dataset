# rabindra-dahal/see-opt-math-qwen3-1.7b-gguf

## Resumen

El modelo `see-opt-math-qwen3-1.7b-gguf` es un ajuste fino de Qwen3-1.7B desarrollado por el usuario rabindra-dahal, orientado a tutorizar a estudiantes nepalíes de Grade 10 en la asignatura de Matemáticas Opcionales de cara al examen SEE (Secondary Education Examination). El modelo parte de la base Qwen/Qwen3-1.7B (1.720.574.976 parámetros) y se distribuye únicamente en formato GGUF cuantizado Q4_K_M (~1,1 GB), lo que permite ejecutarlo completamente offline en dispositivos modestos.

El ajuste se realizó con el framework Unsloth mediante LoRA con rango `r=16` y `lora_alpha=16`, alineando el contenido con el currículo oficial del Curriculum Development Centre (CDC) del Gobierno de Nepal. La propuesta es deliberadamente de nicho: no compite en benchmarks generales, sino que busca ofrecer respuestas paso a paso ajustadas a un temario concreto (álgebra, matrices, geometría analítica, trigonometría, vectores, transformaciones y estadística) en un entorno sin conexión.

Su relevancia actual reside en el caso de uso: un modelo pequeño, con licencia Apache 2.0, ejecutable en un smartphone Android de 4 GB de RAM mediante PocketPal AI o ChatterUI, o en portátil con Ollama. Es un ejemplo de ajuste fino de bajo coste para educación localizada, con soporte de inglés y nepalí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B; detalles específicos de la arquitectura base no disponibles en la información proporcionada) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (GGUF, ~1,1 GB); otros tipos no disponibles |
| Idiomas soportados | Inglés (en), nepalí (ne) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3-1.7B |
| Método de ajuste | LoRA (`r=16`, `lora_alpha=16`) con Unsloth |
| Tamaño del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-1.7B, sobre el que se aplicó un ajuste fino supervisado mediante LoRA con rango 16 y alpha 16 usando Unsloth. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El contenido del ajuste está declarado como alineado con el currículo de Matemáticas Opcionales de Grade 10 del CDC de Nepal, cubriendo ocho unidades: álgebra, continuidad, matrices, geometría de coordenadas, trigonometría, vectores, transformaciones y estadística.

La innovación técnica principal no está en la arquitectura sino en el empaquetado: la conversión a GGUF Q4_K_M reduce el modelo a aproximadamente 1,1 GB, lo que lo hace desplegable en dispositivos con 4 GB de RAM o más. El repositorio incluye instrucciones para ejecución offline en Android (PocketPal AI, ChatterUI) y en escritorio (Ollama con Modelfile), con un system prompt recomendado y parámetros de muestreo (`temperature 0.2`, `top_p 0.9`).

## Capacidades

- Generación de texto y razonamiento matemático paso a paso dentro del temario de Matemáticas Opcionales de Grade 10 (SEE, Nepal).
- Resolución de problemas de álgebra: funciones lineales, cuadráticas, cúbicas, trigonométricas, compuestas e inversas; división de polinomios larga y sintética; teoremas del resto y del factor; progresiones aritméticas y geométricas; programación lineal; ecuaciones cuadráticas.
- Cálculo de determinantes, matrices inversas y aplicación de la regla de Cramer.
- Geometría de coordenadas: ángulo entre rectas, pares de rectas y secciones cónicas (circunferencia).
- Trigonometría: ángulos múltiples y submúltiplos, transformación de fórmulas, identidades condicionales, ecuaciones trigonométricas y altura y distancia.
- Producto escalar y geometría vectorial.
- Transformaciones combinadas, inversión y transformación matricial.
- Estadística descriptiva: desviación cuartil, desviación media y desviación estándar.
- Conversación multi-turno (pipeline declarado como `conversational`).
- Capacidades multilingües limitadas a inglés y nepalí.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el razonamiento se limita al dominio matemático del currículo.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Tutoría offline para estudiantes del SEE: el modelo se carga en un smartphone Android de 4 GB de RAM con PocketPal AI y responde consultas de Matemáticas Opcionales sin conexión, usando el system prompt de tutor recomendado por el autor.
- Resolución guiada de ejercicios de álgebra: el estudiante plantea problemas como el teorema del resto o composición de funciones y recibe el desarrollo paso a paso, útil para comparar con la solución del libro de texto.
- Repaso de trigonometría y geometría analítica: el modelo cubre identidades condicionales, ecuaciones trigonométricas y ángulo entre rectas, adecuado para sesiones de estudio autónomo en zonas con conectividad limitada.
- Práctica de matrices y determinantes: permite generar ejercicios de inversa matricial y regla de Cramer con explicación del procedimiento, útil como apoyo antes de exámenes.
- Despliegue en aulas con hardware modesto: al requerir ~1,1 GB en Q4_K_M, puede ejecutarse en portátiles escolares vía Ollama, permitiendo a un docente ofrecer un asistente local sin coste de API ni dependencia de red.
- Soporte bilingüe inglés-nepalí: estudiantes que preparan el SEE en nepalí pero estudian materiales en inglés pueden alternar entre ambos idiomas en las consultas.
- Prototipado de asistentes educativos de nicho: sirve como referencia para desarrolladores que quieran replicar el flujo de ajuste fino con Unsloth y despliegue GGUF en dominios curriculares concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,1 GB para el archivo Q4_K_M; en la práctica se recomienda al menos 4 GB de RAM libre para cargar el modelo y gestionar el contexto.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojarlo, aunque no hay datos oficiales de compatibilidad.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque el autor no publica una lista verificada.
- Cabe en dispositivos móviles: sí, el autor indica explícitamente smartphones Android con 4 GB o más de RAM.
- Opciones de despliegue: PocketPal AI y ChatterUI (Android), Ollama (Windows, macOS, Linux) con Modelfile; llama.cpp es compatible por el formato GGUF, aunque no se menciona explícitamente en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| see-opt-math-qwen3-1.7b-gguf | 1.720.574.976 | No disponible | en, ne | Apache 2.0 | GGUF (Q4_K_M) | Tutor de Matemáticas Opcionales SEE (Nepal) |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | No disponible en la información proporcionada | Multilingüe (según modelo base) | Apache 2.0 | Safetensors, GGUF (según distribución oficial) | Modelo generalista |
| Otros ajustes finos educativos de Qwen3-1.7B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El propio autor advierte de que modelos de 1,7B parámetros pueden cometer errores aritméticos en operaciones de álgebra o trigonometría de varios pasos; recomienda verificar las respuestas numéricas finales.
- El modelo es solo texto: no genera ni interpreta gráficos de coordenadas, lo que limita su utilidad en temas visuales de geometría analítica.
- El alcance está restringido al currículo de Matemáticas Opcionales de Grade 10 de Nepal; fuera de ese dominio su calidad no está garantizada.
- Idiomas soportados limitados a inglés y nepalí; no se documenta rendimiento en castellano.
- Riesgo de alucinación en pasos intermedios y en la aplicación de teoremas, especialmente en problemas que combinan varias unidades del temario.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud del contenido educativo; conviene revisar el uso en producción educativa.
- No hay datos publicados de benchmarks, contexto máximo ni latencia, lo que dificulta evaluar su rendimiento frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rabindra-dahal/see-opt-math-qwen3-1.7b-gguf
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Framework Unsloth: https://github.com
- Ollama: https://ollama.com
- PocketPal AI: no disponible (enlace no incluido en la información proporcionada)
- Paper o blog del modelo: no disponible
- Repositorio de código o demo: no disponible
