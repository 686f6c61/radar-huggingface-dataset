# CladeTeam/CENO-base-1b-preview

## Resumen

CENO Base 1B (Preview) es un modelo de lenguaje causal especializado en secuencias de ADN, publicado por CladeTeam bajo licencia Apache 2.0. Se trata de un checkpoint de vista previa (preview) de 1.302.429.280 parametros (aproximadamente 1,3 mil millones) que reutiliza la arquitectura hibrida de NVIDIA Nemotron-H, adaptada a un tokenizador a nivel de caracter para nucleotidos. El modelo se distribuye en formato safetensors con codigo remoto de Transformers (`CENOForCausalLM` y `CENOCharLevelTokenizer`), por lo que requiere `trust_remote_code=True` para su carga.

El modelo resuelve tareas de modelado de secuencias biologicas: puntuacion de verosimilitud (likelihood scoring), aprendizaje de representaciones y ajuste fino posterior sobre datos de ADN especificos de especie o tarea. Su relevancia actual radica en que aplica una arquitectura hibrida estado-espacio/transformer (Mamba + attention) de NVIDIA a un dominio cientifico donde la mayoria de modelos disponibles son transformers puros de menor eficiencia en secuencias largas.

Conviene subrayar que, segun la propia model card, los pesos son identicos a los del modelo upstream Nemotron-H: el codigo incluido es un renombrado de la implementacion original y no se declaran datos de entrenamiento adicionales ni ajuste sobre ADN. Se trata, por tanto, de un preview con contrato de inferencia propio y procedencia de post-entrenamiento no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (Nemotron-H): capas Mamba/SSM combinadas con atencion en un transformer causal |
| Parametros totales | 1.302.429.280 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | dna (secuencias de ADN; tokenizador a nivel de caracter) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

CENO hereda la arquitectura de NVIDIA Nemotron-H, un modelo hibrido que intercala capas de espacio de estados (Mamba) con capas de atencion dentro de un transformer causal. El codigo remoto incluido (`configuration_ceno.py`, `modeling_ceno.py`) es un renombrado de la implementacion upstream de Nemotron-H, y la model card afirma explicitamente que los pesos no han sido modificados. La configuracion activa `use_mamba_kernels=true`, lo que exige los paquetes `mamba-ssm` y `causal-conv1d`; en su ausencia puede activarse la ruta Mamba en PyTorch puro estableciendo `config.use_mamba_kernels=False`. El stack probado por el autor es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card tampoco documenta un ajuste especifico sobre ADN: el tokenizador a nivel de caracter (`CENOCharLevelTokenizer`) es la adaptacion declarada al dominio, y el autor advierte que no se infiere un perfil de post-entrenamiento a partir del nombre del checkpoint. La innovacion tecnica destacable es, por tanto, la combinacion de eficiencia en secuencias largas propia de Mamba con la expresividad de la atencion, aplicada a un vocabulario de nucleotidos.

## Capacidades

- Generacion de texto sobre alfabeto de ADN (secuencias de nucleotidos) mediante tokenizacion a nivel de caracter.
- Modelado de verosimilitud de secuencias (likelihood scoring) para evaluar o puntuar fragmentos de ADN.
- Aprendizaje de representaciones (representations learning) utilizable como base para tareas downstream.
- Ajuste fino sobre datos especificos de especie o tarea (downstream finetuning).
- Generacion causal autoregresiva de secuencias geneticas.
- No se declara soporte de tool calling, function calling ni uso como agente.
- No se declaran capacidades multilingues ni de vision, audio o thinking mode.
- No se declara una ventana de contexto concreta.

## Casos de uso

- Puntuacion de variantes geneticas: usar el modelo como modelo de lenguaje para calcular la verosimilitud de una secuencia de referencia frente a una secuencia con variante, y priorizar mutaciones candidatas por su menor probabilidad bajo el modelo.
- Filtrado de secuencias sinteticas: generar candidatos de ADN y descartar aquellos con baja verosimilitud, empleando el modelo como discriminador en pipelines de diseno de secuencias.
- Preentrenamiento de representaciones para clasificacion: extraer embeddings del modelo y ajustar una cabeza ligera para tareas como prediccion de regiones regulatorias o elementos funcionales.
- Ajuste fino especifico de especie: reentrenar sobre genomas de una especie concreta para adaptar el modelo a sus sesgos composicionales y motivos.
- Modelado de regiones largas: aprovechar la arquitectura hibrida Mamba/attention para procesar fragmentos de ADN de mayor longitud que los transformers puros gestionan con coste cuadratico.
- Investigacion en modelos de lenguaje genomicos: servir como linea base reproducible (licencia Apache 2.0) para comparar arquitecturas hibridas frente a transformers clasicos en tareas de ADN.
- Analisis de motivos y patrones: emplear la probabilidad condicional por posicion para detectar motivos sobrerrepresentados o violaciones de composicion esperada en una secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (fp16/bf16): aproximadamente 2,6 GB solo para pesos, mas overhead de activaciones y cache; en la practica se recomienda reservar entre 4 y 6 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070 y superiores).
- GPU profesionales recomendadas para mayor throughput: A100, H100, L40S; tambien funciona en T4 y A10 para inferencia ligera.
- Despliegue: Transformers con `trust_remote_code=True` (stack probado: PyTorch 2.7.0a0, Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3). La model card menciona que HF y vLLM usan entornos separados, lo que sugiere soporte de vLLM, aunque no se detalla la configuracion. No se documenta soporte de llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria. Como referencia estructural, el modelo upstream Nemotron-H (NVIDIA, Apache 2.0) comparte arquitectura y pesos, por lo que su rendimiento seria identico al de este checkpoint; sin embargo, no se han facilitado cifras comparativas en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CENO Base 1B (Preview) | 1.302.429.280 | no disponible | Apache 2.0 | Hugging Face |
| Nemotron-H (upstream) | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face / NVIDIA |
| Alternativas de ADN de ~1B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de vista previa (preview): el autor no garantiza estabilidad del contrato de inferencia ni correccion numerica mas alla de la carga.
- Los pesos son identicos a los de Nemotron-H: no hay evidencia declarada de entrenamiento especifico sobre ADN, por lo que el rendimiento en tareas genomicas puede ser limitado.
- La procedencia del post-entrenamiento no esta documentada; el autor advierte explicitamente que no debe inferirse a partir del nombre del checkpoint.
- La correccion numerica no garantiza generacion libre de repeticiones ni secuencias biologicamente funcionales.
- Requiere `trust_remote_code=True` y ejecucion de codigo Python remoto, con el riesgo de seguridad asociado.
- Depende del stack Mamba/Triton (`mamba-ssm`, `causal-conv1d`); sin ellos debe activarse la ruta PyTorch puro, con posible impacto en rendimiento.
- No se documentan sesgos, riesgos de alucinacion en sentido linguistico ni limitaciones de contexto o idioma mas alla del alfabeto de ADN.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las atribuciones de copyright de AI21 Labs, HuggingFace y NVIDIA, ademas de las modificaciones de CladeTeam.
- Solo 150 descargas y 1 like en el momento de la consulta: comunidad y validacion externa muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-base-1b-preview
- Arbol de archivos: https://huggingface.co/CladeTeam/CENO-base-1b-preview/tree/main
- Repositorio de codigo y uso actual: https://github.com/CladeTeam/CENO
- Modelo upstream Nemotron-H (NVIDIA): no disponible en la informacion proporcionada
