# dcharlot65-openie/Bonsai-1.7B-LittleBit

## Resumen

Bonsai-1.7B-LittleBit es un checkpoint de pesos "vivos" (living weights) publicado por el usuario dcharlot65-openie en Hugging Face, derivado del modelo base prism-ml/Bonsai-1.7B-mlx-1bit. Se trata de una factorización previa que combina LittleBit-2 con Sakana SVF y se distribuye en el formato `.jsyn` propietario de JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch orientado a Kubernetes (JouleKube). El modelo declara 1.720.028.160 parámetros totales y un tamaño equivalente en FP16 de 3.280,69 MB, comprimido a 8,99 MB mediante zstd y CRC32, lo que arroja una media de 0,0249 bits por peso (BPW).

La propuesta técnica es extrema: representación sub-1-bit de los pesos mediante tensores de planos de bits bidimensionales (197 tensores 2D) más 113 vectores 1D para LayerNorm, bias y convoluciones depthwise. El repositorio, sin embargo, tiene un tamaño de 0,0 GB y cero descargas, y la model card no documenta arquitectura del transformer subyacente, datos de entrenamiento, tokenizador ni idiomas. La información disponible se limita al perfil de compresión y a las instrucciones de uso con JouleDB.

Su relevancia actual es acotada y experimental: explora la viabilidad de pesos por debajo de 1 bit en un runtime alternativo a los ecosistemas estándar (llama.cpp, vLLM, TGI), pero no constituye un artefacto listo para producción ni permite evaluar calidad de generación con los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de prism-ml/Bonsai-1.7B-mlx-1bit; transformer presumible, no confirmado) |
| Parametros totales | 1.720.028.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos sub-1-bit (0,0249 BPW); 197 tensores 2D en planos de bits y 113 vectores 1D en precision superior; empaquetado `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del transformer subyacente ni el proceso de entrenamiento del modelo base. Lo que sí se documenta es el esquema de compresión: los pesos se almacenan como 197 tensores bidimensionales de planos de bits (representación sub-1-bit, LittleBit-2) y 113 vectores unidimensionales que conservan LayerNorm, bias y parámetros de convoluciones depthwise en mayor precisión. Sobre esta base se aplica una factorización Sakana SVF (singular value factorization), que da lugar a los "living weights" del checkpoint.

El resultado declarado es un BPW medio de 0,0249 y un fichero `.jsyn` de 8,99 MB frente a los 3.280,69 MB que ocuparía el modelo en FP16 (factor de compresión de 364,78x). No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO. Tampoco se detalla si el modelo base mlx-1bit fue destilado, cuantizado post-entrenamiento o entrenado desde cero en 1 bit. Cualquier afirmación sobre calidad de entrenamiento sería especulativa con la información disponible.

## Capacidades

- Generación de texto: presumible por herencia del modelo base, pero no verificable con los datos publicados.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Integración con JouleDB: carga del checkpoint vía `db.hf_pull(...)` y servido mediante `jouledb serve`, con despliegue declarado como Kubernetes-native (JouleKube) y runtime sin PyTorch.

## Casos de uso

- Experimentación con representaciones sub-1-bit: el checkpoint permite estudiar en la práctica cómo se comporta un modelo de 1,7B con 0,0249 BPW, útil para líneas de investigación en compresión extrema de pesos.
- Despliegue en entornos JouleDB/JouleKube: equipos que ya operen la base de datos termodinámica JouleDB pueden cargar el modelo con `hf_pull` y servirlo en un clúster Kubernetes sin dependencia de PyTorch.
- Pruebas de runtime sin PyTorch: sirve para validar pipelines de inferencia en Rust (instalación vía `cargo binstall jouledb`) en escenarios donde no se quiere arrastrar el stack de PyTorch.
- Evaluación de formatos propietarios: útil para comparar el formato `.jsyn` con safetensors y GGUF en términos de tamaño en disco, tiempo de carga y latencia, aunque no se publican cifras de rendimiento.
- Docencia y demostraciones sobre cuantización extrema: ilustra de forma tangible la diferencia entre cuantización de 1 bit, sub-1-bit y factorización SVF.
- Prototipado de infraestructura "AI-native" en Kubernetes: permite probar el ciclo completo de pull de modelo, almacenamiento y servido dentro de JouleKube antes de comprometerse con modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El fichero `.jsyn` ocupa 8,99 MB, pero se desconoce la memoria necesaria para descomprimir los planos de bits y ejecutar el modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-1.7B-LittleBit | 1.720.028.160 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| prism-ml/Bonsai-1.7B-mlx-1bit (modelo base) | no disponible | no disponible | MLX 1-bit | Apache 2.0 | Hugging Face |
| Modelos de ~1,7B en 4-8 bits (p. ej. familia Qwen/Llama) | ~1,7B | 4K-32K según variante | safetensors, GGUF | variable | amplia |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, tokenizador ni idiomas: no es posible evaluar la calidad del modelo sin pruebas propias.
- El repositorio figura con 0,0 GB de tamaño y 0 descargas, lo que sugiere que el artefacto podría no estar efectivamente subido o que es meramente referencial.
- El formato `.jsyn` es propietario de JouleDB y no es compatible con los ecosistemas estándar (transformers, llama.cpp, vLLM); requiere el runtime específico.
- La compresión a 0,0249 BPW implica una pérdida de información muy agresiva; cabe esperar degradación severa de la calidad respecto al modelo base, aunque no se publican métricas que lo cuantifiquen.
- Riesgo de alucinación: no evaluado ni documentado.
- Sesgos conocidos: no documentados.
- La licencia Apache 2.0 permite uso comercial, pero la atribución al modelo base prism-ml/Bonsai-1.7B-mlx-1bit debe mantenerse; conviene revisar también las condiciones del modelo upstream.
- No apto para producción sin una evaluación previa de calidad, latencia y estabilidad del runtime JouleDB.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Bonsai-1.7B-LittleBit
- Modelo base: https://huggingface.co/prism-ml/Bonsai-1.7B-mlx-1bit
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Paper o blog técnico: no disponible
- Demo: no disponible
