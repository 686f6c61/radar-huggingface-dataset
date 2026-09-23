# Nurymanau/Bonsai-2-27B-CRACK-PTQ1-MLX

## Resumen

Bonsai-2-27B-CRACK-PTQ1-MLX es un reempaquetado en formato safetensors de MLX del modelo cuantizado a nivel ternario (PTQ1_0) publicado por dealignai como Bonsai-2-27B-1bit-CRACK-GGUF. Lo firma el usuario Nurymanau y no introduce ningún algoritmo de compresión nuevo: es una integración de empaquetado y de runtime que conserva los 402 bloques ternarios originales del GGUF (28 bytes por cada 128 pesos) y los ejecuta mediante un operador Metal externo llamado mlx-kquant, en lugar de convertirlos a los pesos afines de 2 bits habituales en MLX.

El paquete está pensado exclusivamente para Apple Silicon: requiere macOS 26.2 o superior, Python 3.10-3.14, la librería mlx-kquant 0.4.13 (que fija mlx 0.32.1) y mlx-lm 0.31.3. El archivo model.safetensors ocupa 5.994.496.877 bytes (unos 5,99 GB decimales), 47.847.949 bytes más que el GGUF de origen, y se acompaña de un tokenizer de 12 MB y scripts de ejecución (quickstart.py y server.py) que exponen una API local de chat en texto.

Su relevancia es acotada y muy específica: demuestra que es posible servir pesos ternarios PTQ1_0 en MLX sin recodificarlos, algo que la carga estándar de mlx_lm.load() no soporta. No es un modelo nuevo ni una mejora de capacidades: la propia model card aclara que la calidad en contexto largo, el streaming, el muestreo y las entradas de visión no están validadas, y que la evidencia empírica se limita a cuatro respuestas cortas codiciosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se hereda del modelo base; la model card no la describe. El nombre del paquete y las etiquetas apuntan a una familia tipo Qwen3, sin confirmacion tecnica) |
| Parametros totales | 5.906.908.672 segun el recuento real de safetensors (el nombre comercial indica "27B", discrepancia no explicada por el autor) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria PTQ1_0 empaquetada, 28 bytes por cada 128 pesos, en 402 matrices. No se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible (la model card no declara idiomas; los ejemplos de uso estan en ruso e ingles) |
| Licencia | apache-2.0 (se incluyen ademas la licencia y el aviso de Prism ML) |
| Formato de pesos | safetensors para MLX; el modelo base de origen esta en GGUF |

Datos adicionales de empaquetado: SHA256 de model.safetensors `e6815083fbd8d0945840f66ed0299be89dcaef4094b6fccc4c5cfdadb27dbb9b`; revision del GGUF de origen `9665897ee63152226ecd64a1036d14292397186f`, con SHA256 `dcca61238e280432c4ce2d4c6c1d61214cbcb8a5d93ed98dea20d8bcef385a42`. Tamano del repositorio: 6,0 GB.

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. Lo unico verificable es la cadena de procedencia declarada: el paquete deriva del GGUF de dealignai, que a su vez procede de los pesos CRACK aplicados sobre Prism ML Bonsai 2, presentado en el repositorio prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y descrito por el autor como derivado de "Qwen3.8-27B". Este repositorio no entrena ni ajusta nada: es un reempaquetado.

La innovacion tecnica real esta en el plano del runtime, no del modelo. Los pesos ternarios se mantienen en su representacion PTQ1_0 original (bloques empaquetados de 28 bytes por 128 pesos) y se multiplican en tiempo de inferencia con un operador Metal dedicado proporcionado por mlx-kquant. Segun la model card, un verificador independiente comprobo byte a byte las 402 matrices empaquetadas contra el GGUF de origen tras el reordenamiento de filas necesario. El resultado es que el esquema PTQ1_0/Hadamard resultante no es cargable con mlx_lm.load() estandar, y solo funcionan los puntos de entrada incluidos (quickstart.py y server.py). Existe una release alternativa del mismo linaje, dealignai/Bonsai-2-27B-CRACK-1.75bit-JANG, que usa un codec empaquetado distinto y el runtime vMLX.

## Capacidades

- Generacion de texto conversacional en modo texto unicamente, sin soporte de vision.
- Inferencia determinista: el servidor acepta peticiones con temperatura 0 y no implementa muestreo.
- API local compatible con el esquema de OpenAI para `POST /v1/chat/completions` (no streaming) y `GET /v1/models`.
- Ejecucion local en Apple Silicon sin conexion a servicios externos.
- Verificacion de integridad del empaquetado: manifiesto de construccion y comprobacion byte a byte de las 402 matrices empaquetadas frente al GGUF de origen.
- No validado: tool calling, function calling, uso agentico, razonamiento multi-paso, modo thinking, audio, vision, streaming, LoRA y calidad en contexto largo.

## Casos de uso

- Prototipado local en Mac sin GPU dedicada: con 6 GB de pesos y 16 GB de memoria unificada, un MacBook Air M3 puede cargar el paquete y responder peticiones de chat cortas a traves de server.py, lo que permite experimentar con modelos cuantizados sin infraestructura en la nube.
- Investigacion sobre cuantizacion ternaria: el repositorio conserva los bloques PTQ1_0 sin recodificar, de modo que sirve como material de referencia para estudiar el impacto del empaquetado de 28 bytes por 128 pesos en la calidad de salida.
- Desarrollo de operadores Metal personalizados: el paquete depende de mlx-kquant y de la multiplicacion de bloques empaquetados en el kernel, por lo que es un banco de pruebas util para medir el rendimiento de operadores Metal alternativos frente a rutas afines de 2 bits.
- Servicio de asistente conversacional offline de baja exigencia: la API compatible con OpenAI permite integrar un endpoint local en un script o interfaz propia que exija confidencialidad total de los datos, siempre asumiendo respuestas deterministas y sin streaming.
- Validacion de pipelines de conversion GGUF a MLX: los scripts de construccion (bonsai_crack_compact_build.py) y el manifiesto permiten reproducir el repacking y comprobar la equivalencia numerica con el GGUF fuente antes de adoptarlo en un flujo propio.
- Comparacion de runtimes en Apple Silicon: el autor reporto 4,0 tokens/s en decodificacion frente a 5,1-5,4 tokens/s del servidor Metal del GGUF de PrismML, un dato util para decidir entre servir el GGUF original o esta variante MLX.
- Docencia y demostraciones de cuantizacion extrema: ilustra de forma tangible las diferencias entre formatos empaquetados (PTQ1_0 ternario, 1,75 bits JANG, afines de 2 bits de MLX) y sus implicaciones de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta mediciones de runtime y una comprobacion cualitativa de humo:

| Medicion | Valor |
|---|---|
| Tiempo de carga en MacBook Air M3 con 16 GB | 2,19 s |
| Velocidad de decodificacion en respuesta de 3 tokens ("Привет") | ~4,0 tokens/s |
| Velocidad de referencia del servidor Metal del GGUF de PrismML | ~5,1-5,4 tokens/s |
| Salidas de la prueba de humo (greedy) | `4`, `Paris`, `6`, `Привет` |

El propio autor advierte que esta prueba no establece capacidad general ni equivalencia numerica completa.

## Requisitos de hardware

- VRAM / memoria: el archivo de pesos ocupa unos 6 GB decimales (5,99 GB), por lo que se necesita espacio para pesos, activaciones y cache KV. El autor lo probo con exito en un MacBook Air M3 con 16 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon. MLX no se ejecuta en GPU NVIDIA o AMD, por lo que A100, H100 o RTX 4090 no son aplicables a este paquete.
- Compatibilidad con GPU de consumo: si cabe en Macs de gama de entrada con 16 GB unificados; no hay soporte CUDA.
- Software: macOS 26.2 o superior, Python 3.10-3.14, mlx-kquant 0.4.13 (que fija mlx 0.32.1), mlx-lm 0.31.3, NumPy, tokenizers y Jinja2.
- Opciones de despliegue: quickstart.py para inferencia puntual y server.py para la API local. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que el esquema PTQ1_0/Hadamard no lo carga mlx_lm.load() estandar y depende del operador Metal de mlx-kquant.
- Latencia y throughput: carga en 2,19 s y aproximadamente 4,0 tokens/s en decodificacion de respuestas cortas en M3 con 16 GB; no se han publicado mediciones de contexto largo ni de lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / codec | Runtime | Licencia | Observaciones |
|---|---|---|---|---|---|
| Nurymanau/Bonsai-2-27B-CRACK-PTQ1-MLX (este) | 5,906.908.672 segun safetensors | safetensors MLX, ternario PTQ1_0 sin recodificar | mlx-kquant + Metal, API local | apache-2.0 | Repack con verificacion byte a byte; sin benchmarks publicados |
| dealignai/Bonsai-2-27B-1bit-CRACK-GGUF (modelo base) | no disponible | GGUF, ternario PTQ1_0 | llama.cpp / servidor Metal de PrismML | no disponible en la informacion | Fuente del repack; ~5,1-5,4 tokens/s en las mismas pruebas |
| dealignai/Bonsai-2-27B-CRACK-1.75bit-JANG | no disponible | codec empaquetado JANG, 1,75 bits | vMLX | no disponible en la informacion | Misma familia CRACK, codec y runtime distintos |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | no disponible | MLX afines de 2 bits | MLX estandar | no disponible en la informacion | Origen de la linea Bonsai 2; usa pesos afines, no bloques empaquetados |

No hay datos de rendimiento comparativo entre estas variantes mas alla de la velocidad de decodificacion citada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un algoritmo de compresion: es un reempaquetado con fines de compatibilidad. No debe presentarse como una mejora de capacidades.
- Discrepancia de nomenclatura: el nombre indica 27B, pero el recuento real de parametros en safetensors es de 5.906.908.672. El autor no explica esta diferencia.
- Capacidades no validadas explicitamente: vision, streaming, muestreo, LoRA y calidad en contexto largo. La evidencia empirica son cuatro respuestas codiciosas cortas.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Con cuantizacion ternaria extrema y sin benchmarks publicados, la fiabilidad factual es desconocida.
- Idiomas: no se declaran lenguajes soportados; los ejemplos de la model card estan en ruso e ingles, sin garantia de cobertura multilingue.
- API muy restringida: solo texto, sin streaming, determinista y con acceso por defecto en loopback. No hay soporte documentado de tool calling ni de flujos agenticos.
- Incompatibilidad de herramienta: no carga con mlx_lm.load() estandar ni con los servidores habituales (vLLM, TGI, llama.cpp, Ollama). Depende de versiones fijadas de mlx y mlx-kquant, lo que complica el mantenimiento a medio plazo.
- Licencia: el repositorio declara apache-2.0 y afirma distribuir los pesos bajo la licencia Apache 2.0 del modelo fuente, pero ademas incluye la licencia y el aviso de Prism ML. Conviene revisar ambos textos antes de un uso comercial, ya que el paquete incorpora componentes de terceros con sus propias condiciones.
- Trazabilidad: el autor reconoce no reclamar la propiedad del modelo base, de la modificacion CRACK ni de los kernels de mlx-kquant. Existe una release alternativa (1.75 bits JANG) que podria ser mas adecuada segun el caso.
- Madurez: cero descargas y cero likes en el momento de la consulta, y creacion y ultima actualizacion en la misma fecha. Es un artefacto reciente y sin adopcion documentada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Nurymanau/Bonsai-2-27B-CRACK-PTQ1-MLX
- Modelo base (GGUF): https://huggingface.co/dealignai/Bonsai-2-27B-1bit-CRACK-GGUF
- Release alternativa JANG de 1,75 bits: https://huggingface.co/dealignai/Bonsai-2-27B-CRACK-1.75bit-JANG
- Modelo de origen Bonsai 2 en MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Repositorio del conversor y verificador: https://github.com/Obscyra-app/bonsai-crack-ptq1-mlx
- Script de construccion del repack: https://github.com/Obscyra-app/bonsai-crack-ptq1-mlx/blob/main/bonsai_crack_compact_build.py
- Operador Metal mlx-kquant: https://github.com/asher/mlx-kquant
