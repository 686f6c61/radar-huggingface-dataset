# dendriteholdings/Ingot-IV-9B-MLX-2bit

## Resumen

Ingot-IV-9B-MLX-2bit es un modelo de lenguaje de 9.410.903.280 parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que mas se aproxima a el. El modelo deriva de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, a su vez un refinamiento ternario de Qwen3.5-9B, y ha sido ajustado por el minero para acercar sus pesos al profesor original. La relevancia es doble: por un lado documenta un caso real de cuantizacion competitiva a 2 bits sobre Apple Silicon; por otro, ofrece un empaquetado MLX de pesos ternarios que decodifican de forma identica al kernel GGUF equivalente.

El repositorio ocupa 3,5 GB y contiene un unico `model.safetensors` de 3,46 GB con 2,25 bits por peso (codigos de 2 bits mas escala fp16 y sesgo por cada bloque de 128 pesos). Emplea el layout `prism_hadamard_qwen35`, que mlx-lm no carga de forma nativa; requiere MTPLX para servirlo como API compatible con OpenAI. El modelo se presenta como text-generation conversacional, sin datos publicados sobre licencia, idiomas soportados ni benchmarks estandar.

No se trata de un modelo nuevo entrenado desde cero, sino de una re-cuantizacion y re-ajuste de pesos existentes. Esto implica que sus capacidades heredan las del profesor Qwen3.5-9B, atenuadas por la agresividad de la cuantizacion ternaria, y que su interes practico esta en el despliegue eficiente en hardware Apple, no en mejoras de calidad frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B), pesos ternarios con layout `prism_hadamard_qwen35` |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (2,25 bits por peso: codigos de 2 bits + escala fp16 y sesgo por bloque de 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit); existe un gemelo GGUF en dendriteholdings/Ingot-IV-9B-Q2 |

## Arquitectura y entrenamiento

El modelo es un transformer denso heredado de Qwen3.5-9B a traves de la cadena prism-ml/Ternary-Bonsai-2-9B-mlx-2bit. La innovacion principal no esta en la arquitectura sino en la representacion de pesos: cada bloque de 128 pesos conserva codigos ternarios y una escala fp16, empaquetados como valores MLX affine de 2 bits con escala `d` y sesgo `-d`, de modo que cada peso decodifica al mismo numero que usa el kernel GGUF. El proceso de entrenamiento no se describe en la informacion disponible; lo que si se documenta es el mecanismo de seleccion: un minero de Bittensor (hotkey `5Doa8vFPLjiAZ31eZwv3XDX7BY8HvBXXhhjcy86sXg3QEfye`, uid 147) re-ajusto los pesos no ternarios para acercarlos al profesor Qwen3.5-9B, y su submission fue coronada por el validador del subnet.

La metrica de seleccion es la divergencia KL entre las distribuciones del siguiente token del profesor BF16 y las del modelo candidato, calculada sobre los tokens de respuesta de cada dominio y ponderada por la cuota de muestras de cada dominio. El modelo ganador obtuvo KL 0,07922 frente a 0,08391 del rey al que supero en la misma evaluacion. El tower de vision, la configuracion, el tokenizer y los vectores de signo de Hadamard son los originales de Prism ML y no los modifica la competicion. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del profesor Qwen3.5-9B.
- Razonamiento y conocimiento general en la medida en que sobreviven a la cuantizacion ternaria; el ajuste del minero busca precisamente preservar la fidelidad al profesor.
- Capacidad de vision: el tower de vision se conserva intacto desde Prism ML, aunque la model card no detalla su comportamiento tras la cuantizacion.
- Soporte de tool calling y function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no incluye cabeza draft MTP, por lo que MTPLX decodifica un token por paso.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el empaquetado MLX de 3,46 GB permite ejecutar un modelo de 9B en Macs con memoria unificada moderada, sirviendolo via MTPLX como API compatible con OpenAI en el puerto 8080.
- Experimentacion con cuantizacion ternaria: util para investigadores que quieran reproducir el pipeline de evaluacion KL frente a un profesor BF16 y comparar variantes de cuantizacion en el subnet Ingot.
- Prototipado de asistentes conversacionales en local: al heredar el comportamiento de Qwen3.5-9B, sirve para validar flujos de chat antes de pasar a un modelo mayor o a un despliegue en nube.
- Evaluacion comparativa de fidelidad: el par KL del modelo (0,07922) y del rey anterior (0,08391) permite usarlo como referencia en estudios sobre degradacion por cuantizacion agresiva.
- Despliegue en entornos con restricciones de memoria: 2,25 bits por peso reducen drasticamente la huella frente a un BF16 de 9B, lo que facilita correr el modelo en portatiles y equipos de sobremesa con GPU integrada.
- Integracion en pipelines de investigacion sobre Bittensor: sirve como artefacto de referencia para mineros que quieran inspeccionar el formato de pesos ganador y el layout `prism_hadamard_qwen35`.
- Pruebas de vision en local: al conservar el tower de vision de Prism, puede emplearse para experimentar con tareas imagen-texto en hardware Apple, aunque sin garantias documentadas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de evaluacion es la divergencia KL frente al profesor BF16:

| Metrica | Este modelo | Rey anterior |
|---|---|---|
| KL(profesor ‖ modelo), evaluacion ganadora | 0,07922 | 0,08391 |

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 3,46 GB en safetensors; en MLX sobre memoria unificada se necesita espacio adicional para cache KV y activaciones, no cuantificado en la informacion disponible.
- GPU recomendadas: hardware Apple Silicon con soporte MLX; no se documentan GPU NVIDIA ni AMD para este empaquetado.
- Cabe en consumer GPU: si, en equipos Apple Silicon con memoria unificada suficiente; el gemelo GGUF puede ejecutarse en el fork de llama.cpp de Dendrite.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve --model dendriteholdings/Ingot-IV-9B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`); para el gemelo GGUF, el fork DendriteLabs/llama.cpp. mlx-lm no carga el layout `prism_hadamard_qwen35`.
- Latencia y throughput: no disponibles; al no incluir cabeza draft MTP, MTPLX decodifica un token por paso, sin decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-IV-9B-MLX-2bit | 9,41B | no disponible | 2-bit ternario MLX | no disponible | Hugging Face (MLX) |
| Ingot-IV-9B-Q2 | no disponible | no disponible | 2-bit ternario GGUF | no disponible | Hugging Face (GGUF) |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | no disponible | no disponible | 2-bit ternario MLX | no disponible | Hugging Face |
| Qwen3.5-9B (profesor) | ~9B | no disponible | BF16 | no disponible | Hugging Face |

La comparativa se limita a la cadena de derivacion documentada; no hay datos de rendimiento estandar que permitan contrastar calidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion ternaria a 2,25 bits por peso introduce degradacion frente al profesor BF16; el propio autor la cuantifica con un KL de 0,07922, no nulo.
- No se declara licencia, lo que impide asumir permisos de uso comercial; debe verificarse con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- El layout `prism_hadamard_qwen35` no es compatible con mlx-lm; requiere MTPLX o herramientas equivalentes, lo que limita la portabilidad.
- Sin cabeza draft MTP, no hay decodificacion especulativa y el throughput por paso es el de un decodificador autoregresivo estandar.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al heredar el profesor, arrastra los sesgos de Qwen3.5-9B sin mitigaciones documentadas.
- El modelo es un artefacto de competicion con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-IV-9B-MLX-2bit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-IV-9B-Q2
- MTPLX: https://github.com/youssofal/mtplx
- Fork llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
