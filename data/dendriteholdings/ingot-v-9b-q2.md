# dendriteholdings/Ingot-V-9B-Q2

## Resumen

Ingot-V-9B-Q2 es un modelo de generacion de texto derivado de Prism ML Ternary Bonsai 2 9B, publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que mas se aproxima a el. El modelo conserva los codigos ternarios de Bonsai 2 y reajusta el resto de pesos para acercarse a Qwen3.5-9B, que actua como profesor de referencia en la evaluacion.

Con 8.953.803.264 parametros totales (aproximadamente 9B) y un peso por parametro de 1,75 o 2,125 bits segun el fichero, el modelo ocupa entre 2,00 y 2,42 GB en formato GGUF. Es un caso poco habitual: no es un modelo entrenado desde cero ni un finetune convencional, sino el resultado de un proceso de cuantizacion competitiva optimizado contra una metrica de divergencia KL respecto al profesor.

Su relevancia practica es doble. Por un lado, demuestra que la cuantizacion agresiva por debajo de 2 bits puede mantener una fidelidad medible frente a un profesor BF16. Por otro, su ejecucion requiere un fork especifico de llama.cpp (DendriteLabs), no compatible con llama.cpp estandar, lo que limita su adopcion fuera del ecosistema Ingot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ternary Bonsai 2 9B, pesos ternarios con rotacion Hadamard) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bits por peso) y PQ2_0 (2,125 bits por peso, contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (tambien disponible un pack MLX de 2 bits en repo separado) |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 9B de Prism ML, un transformer de aproximadamente 9B parametros cuyos pesos se representan en codigos ternarios (valores -1, 0, +1) con escala fp16 por bloque de 128 pesos. Sobre esa base, el minero de Ingot reajusto los pesos no ternarios para minimizar la divergencia respecto a Qwen3.5-9B, manteniendo intactos los codigos ternarios originales. El resultado conserva el layout, el tokenizer y la rotacion Hadamard del modelo genesis de dendriteholdings.

El proceso de seleccion es competitivo: los mineros suben cuantizaciones y el validador mide la KL(teacher || model) de las distribuciones de siguiente token sobre los tokens de respuesta de cada dominio, ponderando por la cuota de muestras de cada dominio. La submission ganadora obtuvo una KL de 0,07439 frente a 0,07785 del rey al que desplazo en la misma evaluacion. El fichero PTQ1_0 es un reempaquetado sin perdida del PQ2_0 original: cada bloque de 128 pesos conserva sus codigos y su escala fp16, de modo que cada peso decodifica al mismo valor.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la model card proporcionada.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento y respuesta multi-turno heredados del modelo base Bonsai 2, aunque no se documentan evaluaciones especificas.
- Soporte de plantillas de chat mediante `--jinja` en llama-server.
- Entrada de imagenes opcional: requiere anadir el vision tower de Ternary Bonsai 2 como proyector (`Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf` o `-BF16.gguf`). La calidad de imagen no esta evaluada y el proyector se creo para el modelo genesis, no para estos pesos.
- Tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking explicito: no documentado.

## Casos de uso

- Despliegue en hardware muy limitado: con 2,00-2,42 GB de pesos, el modelo cabe en GPUs de gama de entrada y en CPU con suficiente RAM, lo que permite servir generacion de texto en entornos donde un 9B en BF16 (unos 18 GB) seria inviable.
- Investigacion sobre cuantizacion extrema: util como referencia reproducible para estudiar la relacion entre bits por peso y fidelidad al profesor, gracias a la metrica KL publicada y a los dos empaquetados equivalentes.
- Experimentacion con el ecosistema Bittensor/Ingot: permite reproducir la evaluacion del validador y comparar submissions con el fork de llama.cpp en el commit exacto `9991ae5`.
- Prototipado de asistentes conversacionales en local: el soporte de plantillas Jinja y el formato GGUF facilitan montar un servidor de chat con llama-server sin infraestructura cloud.
- Pruebas de concepto multimodales: anadiendo el proyector mmproj de Bonsai 2 se puede experimentar con entrada de imagen, asumiendo que la calidad no esta garantizada.
- Inferencia en Apple Silicon: el pack MLX de 2 bits en el repo `Ingot-V-9B-MLX-2bit` permite ejecutar el modelo en Macs con memoria unificada, sin depender del fork de llama.cpp en CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de evaluacion es la divergencia KL frente al profesor BF16:

| Metrica | Este modelo | Rey al que desplazo |
|---|---|---|
| KL(teacher ‖ model), media ponderada por dominio | 0,07439 | 0,07785 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,0 GB para el fichero PTQ1_0 (1,75 bpw) y 2,4 GB para el PQ2_0 (2,125 bpw), sin contar el contexto KV cache ni el proyector de vision.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo solo; con contexto largo o vision conviene disponer de 8 GB o mas. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas, dado el reducido tamano de los pesos.
- Opciones de despliegue: llama.cpp mediante el fork de DendriteLabs en el commit `9991ae551cc08c354971ebbe739931c1f9dcfcc8`, compilado con `-DGGML_CUDA=ON`. llama.cpp estandar no ejecuta el modelo. Para Apple Silicon existe el pack MLX de 2 bits.
- Comando de referencia: `build/bin/llama-server -m Ingot-V-9B-PQ2_0.gguf -ngl 99 -fa on --jinja`.
- Latencia y throughput: no disponibles. La model card senala que el fichero de 1,75 bpw es mas pequeno pero el de 2 bits decodifica mas rapido en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-V-9B-Q2 | 8,95B | no disponible | 1,75 / 2,125 bpw | no disponible | GGUF + MLX, requiere fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-9B-gguf (base) | ~9B | no disponible | ternaria (PQ2_0, PTQ1_0) | no disponible | GGUF, llama.cpp de PrismML |
| dendriteholdings/Ingot-genesis-9B-Q2 | ~9B | no disponible | 2 bits | no disponible | GGUF, mismo layout y tokenizer |
| Qwen3.5-9B (profesor de referencia) | ~9B | no disponible | BF16 y otras | no disponible en esta ficha | no disponible en esta ficha |

La comparacion con Qwen3.5-9B es relevante porque actua como profesor en la evaluacion de Ingot: el objetivo del minero era acercar las distribuciones de Bonsai 2 a las de Qwen3.5-9B, no superarlo en benchmarks absolutos.

## Limitaciones y advertencias

- Compatibilidad restringida: no funciona con llama.cpp estandar; requiere el fork de DendriteLabs en un commit concreto, lo que complica el mantenimiento y la integracion en pipelines existentes.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un riesgo bloqueante para produccion.
- Idiomas no documentados: no hay garantia de calidad fuera del idioma o idiomas con los que se entreno el modelo base.
- Contexto no documentado: se desconoce la ventana maxima soportada, lo que impide planificar casos de uso con documentos largos.
- Vision no validada: el proyector mmproj se creo para el modelo genesis, no para estos pesos, y Ingot solo evalua el modelo de texto; la calidad de imagen es incierta.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion extrema puede ampliar la deriva respecto al profesor en dominios poco representados en la evaluacion.
- Sesgos: no documentados, pero heredados del modelo base y del profesor Qwen3.5-9B.
- Procedencia: es una submission de un minero anonimo (hotkey `5Dr4yVG4RfvTzANhqQ5ZoR3rS9tQaeQ4wk9epfpJN2EGhytT`, uid 216); no hay garantia de auditoria externa mas alla de la metrica KL del validador.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-V-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo genesis con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-V-9B-MLX-2bit
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluacion: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
