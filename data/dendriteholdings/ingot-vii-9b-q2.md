# dendriteholdings/Ingot-VII-9B-Q2

## Resumen

Ingot-VII-9B-Q2 es un modelo de lenguaje de 8.953.803.264 parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que mas se aproxima a el. El modelo parte de Prism ML Ternary Bonsai 2 9B y conserva sus codigos ternarios, mientras que el resto de pesos han sido reajustados por el minero para acercar la salida a Qwen3.5-9B, que actua como profesor de referencia.

Se distribuye unicamente en formato GGUF con dos variantes: una de 1,75 bits por peso (2,00 GB) y otra de 2,125 bits por peso en contenedor de 2 bits (2,42 GB). Ambas contienen exactamente los mismos pesos ternarios; la primera es un reempaquetado sin perdida al formato PTQ1_0 de Prism y la segunda decodifica mas rapido en GPU. La relevancia de esta ficha radica en que documenta un caso poco habitual: un modelo derivado de un proceso competitivo descentralizado de cuantizacion, con metricas de fidelidad respecto al profesor (KL por token) en lugar de benchmarks convencionales.

El modelo no funciona con llama.cpp estandar: requiere el fork de DendriteLabs de llama.cpp de PrismML, en el commit concreto con el que fue evaluado. No se han publicado datos sobre licencia, idiomas soportados ni resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Ternary Bonsai 2 9B, con pesos ternarios y rotacion de Hadamard (detalle de capas no disponible) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 a 1,75 bits por peso (2,00 GB) y PQ2_0 a 2,125 bits por peso en contenedor de 2 bits (2,42 GB); pesos ternarios en ambos casos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); tambien disponible un pack MLX de 2 bits en otro repositorio |
| Modelo base | prism-ml/Ternary-Bonsai-2-9B-gguf (finetune) |
| Tamano del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Ternary Bonsai 2 9B de Prism ML, un transformer con pesos ternarios que el modelo hereda intactos en sus codigos. Sobre esa base, el minero reajusto el resto de los pesos (escalas y componentes no ternarios) con el objetivo de minimizar la divergencia respecto a Qwen3.5-9B, el profesor fijo del subnet Ingot. El layout, el tokenizer y la rotacion de Hadamard son los del modelo dendriteholdings/Ingot-genesis-9B-Q2.

El proceso de seleccion es la innovacion principal: Ingot evalua cada submission midiendo la divergencia de la distribucion de siguiente token respecto al profesor BF16 sobre los tokens de respuesta de cada dominio, ponderando los dominios por su cuota de muestras. El modelo ganador obtuvo un KL de 0,07117 frente al 0,07465 del modelo que ostentaba el titulo en la misma evaluacion. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el ajuste se orienta a la fidelidad distribucional, no a preferencias humanas.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento y codigo: capacidades heredadas del modelo base y del profesor Qwen3.5-9B, sin evaluacion publicada en esta ficha.
- Entrada de imagenes opcional mediante el proyector multimodal de Ternary Bonsai 2 (mmproj en Q8_0 o BF16), aunque el autor advierte que la calidad visual no esta probada y que Ingot solo puntua el modelo de texto.
- Soporte de plantillas de chat mediante `--jinja` en llama-server, lo que habilita el formato conversacional del tokenizer heredado.
- Tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Investigacion sobre cuantizacion extrema: el modelo sirve como referencia para estudiar hasta que punto una representacion ternaria a 1,75 bits por peso puede aproximarse a un transformer de 9B en BF16, usando la metrica KL publicada como linea base reproducible.
- Despliegue en hardware muy limitado: con 2,00 GB en disco y pesos ternarios, es viable ejecutar un modelo de 9B en GPUs de consumo con poca VRAM o incluso en entornos integrados, siempre que se compile el fork de llama.cpp requerido.
- Reproduccion de evaluaciones de subnets Bittensor: permite replicar el pipeline de Ingot (profesor Qwen3.5-9B, calculo de KL por token, ponderacion por dominio) y verificar el resultado 0,07117 publicado.
- Servidor de chat ligero: mediante `llama-server` con `-ngl 99 -fa on --jinja` se puede levantar un endpoint compatible con la API de OpenAI para prototipos de conversacion con huella de memoria minima.
- Experimentos multimodales de bajo coste: anadiendo el mmproj de Ternary Bonsai 2 se puede explorar entrada de imagenes en un modelo ternario, asumiendo que la calidad no esta validada.
- Comparacion de formatos de cuantizacion: los dos ficheros permiten medir en la practica la diferencia de velocidad de decodificacion entre PTQ1_0 (1,75 bpw) y PQ2_0 (2,125 bpw) con pesos identicos, util para decidir el formato en produccion.
- Base para nuevos fine-tunes ternarios: al estar los pesos en GGUF con layout documentado, sirve como punto de partida para ajustes posteriores orientados a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica publicada es la divergencia KL respecto al profesor:

| Metrica | Ingot-VII-9B-Q2 | Modelo reinante anterior |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta, ponderado por dominio | 0,07117 | 0,07465 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,5 GB para el fichero PTQ1_0 y 2,4-3,0 GB para el PQ2_0, mas overhead de contexto y cache KV (no cuantificado en la informacion disponible).
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM para el modelo solo; el autor usa compilacion con `-DGGML_CUDA=ON` y `-ngl 99`, por lo que se espera soporte en A100, H100 y RTX 4090, aunque no se publican cifras de latencia en esas tarjetas.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, dado el tamano de 2,0-2,42 GB de los ficheros.
- Opciones de despliegue: exclusivamente el fork de DendriteLabs de llama.cpp en el commit `9991ae551cc08c354971ebbe739931c1f9dcfcc8`; llama.cpp estandar no ejecuta estos ficheros. Existe un pack MLX de 2 bits para Apple Silicon en dendriteholdings/Ingot-VII-9B-MLX-2bit. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor senala cualitativamente que el fichero de 2 bits decodifica mas rapido en GPU que el de 1,75 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y bits | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-VII-9B-Q2 | 8,95B | no disponible | GGUF, 1,75 y 2,125 bpw | no disponible | Requiere fork de llama.cpp; KL 0,07117 |
| prism-ml/Ternary-Bonsai-2-9B-gguf | 9B (aproximado) | no disponible | GGUF ternario (PQ2_0, PTQ1_0, mmproj) | no disponible | Modelo base de Prism ML; incluye torre de vision |
| dendriteholdings/Ingot-genesis-9B-Q2 | 9B (aproximado) | no disponible | GGUF ternario | no disponible | Mismo layout, tokenizer y rotacion de Hadamard; predecesor en el linaje Ingot |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a formato, procedencia y la metrica KL del propio subnet.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, lo que impide asumir viabilidad legal en produccion sin consultar al autor.
- Compatibilidad restringida: no funciona con llama.cpp estandar ni con los runners habituales (vLLM, TGI, Ollama); depende de un commit concreto de un fork, lo que ancla el despliegue a esa version.
- Calidad multimodal sin validar: el proyector de vision fue creado para genesis, no para estos pesos, y el subnet solo evalua el modelo de texto.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de robustez; el ajuste optimiza fidelidad al profesor, no correccion factual.
- Sesgos: no documentados; al heredar el comportamiento distribucional de Qwen3.5-9B y de Ternary Bonsai 2, arrastra los sesgos de ambos sin que exista una evaluacion especifica.
- Idiomas: no se especifica la cobertura linguistica, por lo que no se puede garantizar un rendimiento aceptable fuera del ingles sin pruebas.
- Contexto: se desconoce la longitud de ventana soportada, lo que limita el diseno de aplicaciones con documentos largos.
- Madurez: cero descargas y cero likes en el momento de la ficha, publicacion reciente y sin comunidad que valide el comportamiento en produccion.
- Trazabilidad: el modelo es un espejo de una submission de minero (hotkey `5G6CPQiN4d1anifqsYprLTE2tTeL7miGuJnKZKadbsKBh41w`, uid 234); cambios o retiradas en el subnet pueden afectar a su mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-VII-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-VII-9B-MLX-2bit
- Modelo predecesor con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Fork de llama.cpp requerido: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluacion: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8
