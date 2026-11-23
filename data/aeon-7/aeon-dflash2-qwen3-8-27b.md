# AEON-7/AEON-DFlash2-Qwen3.8-27B

## Resumen

AEON DFlash2-Qwen3.8-27B es un modelo borrador (draft model) para decodificación especulativa, desarrollado por AEON-7 y afinado a partir de `z-lab/Qwen3.8-27B-DFlash2` (espejo de `incoai/Qwen3.8-27B-DFlash2`, Apache-2.0), que a su vez se construye sobre la técnica DFlash 2 de Inco AI y z-lab. No es un modelo de chat autónomo: su función es proponer hasta nueve tokens en una sola pasada paralela para que el modelo objetivo de 27B los verifique, acepte los que coinciden y descarte el resto mediante muestreo por rechazo. El resultado es una aceleración de la inferencia sin alterar la distribución de salida del modelo objetivo.

El modelo está especializado en el serving real del target `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED`, por lo que su utilidad está ligada a ese par drafter-target concreto. Se distribuye en dos precisiones: un paquete NVFP4 W4A16 (pesos MLP de 4 bits, activaciones de 16 bits, 1,93 GB) para NVIDIA Blackwell con vLLM, y pesos BF16 (3,85 GB) en la carpeta `bf16/` para el resto de arquitecturas y motores. El repositorio ocupa 11,6 GB y el checkpoint en safetensors declara 1.255.937.280 parámetros, coherente con un drafter ligero y no con el modelo de 27B del nombre.

La relevancia actual reside en que la decodificación especulativa se ha convertido en la palanca principal para reducir latencia en despliegues de LLM de gran tamaño, y este modelo aporta métricas concretas sobre hardware de borde para centros de datos (DGX Spark, GB10, Blackwell): +21,1 % de tokens por segundo frente al drafter estándar a temperatura 0,6 y 3,24× frente a decodificación plana con un usuario, según mediciones del autor con la etapa de entrenamiento anterior (lk3). El acceso está restringido (gated) y la versión publicada se etiqueta como early access.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador (draft model) para decodificación especulativa, basado en DFlash 2 con drafting paralelo por bloques (block-diffusion); fine-tune de `z-lab/Qwen3.8-27B-DFlash2` |
| Parametros totales | 1.255.937.280 (según safetensors del repo) |
| Parametros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (4 bits en pesos MLP, 16 bits en activaciones) para Blackwell; BF16 en la carpeta `bf16/`; tag `8-bit` y `modelopt_mixed` en metadatos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con obligación de conservar LICENSE y NOTICE y acreditar a AEON-7 y z-lab / Inco AI) |
| Formato de pesos | safetensors (NVFP4 W4A16 en la raíz del repo; BF16 en `bf16/`) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa construido sobre DFlash 2, la técnica de Inco AI y z-lab que genera propuestas de tokens en paralelo mediante un esquema de difusión por bloques: en lugar de proponer un token por paso autorregresivo, el borrador emite hasta nueve tokens en una sola pasada y el modelo objetivo de 27B los verifica todos a la vez, aceptando el prefijo correcto y aplicando muestreo por rechazo para el resto. Esta verificación hace que el proceso sea sin pérdida por construcción, ya que cada token aceptado ha sido validado por el target. El checkpoint es un fine-tune de `z-lab/Qwen3.8-27B-DFlash2` orientado a cómo se sirve realmente el target `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED`, no un entrenamiento desde cero.

Los detalles de composición del dataset de entrenamiento, número de tokens y uso de RLHF o DPO no están disponibles en la información proporcionada. El autor sí documenta el proceso de selección de checkpoint: la versión v1.0 se actualizó en las primeras horas desde el paso 690 al paso 753 (etapa lk4) siguiendo la regla de desempate de la release, con una aceptación offline idéntica (+0,70 % frente a lk3 y +4,87 % frente al z-lab estándar). La innovación destacable es el empaquetado NVFP4 W4A16 específico para Blackwell, que reduce el borrador a 1,93 GB y lo hace desplegable junto al target en una única DGX Spark.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone hasta nueve tokens por pasada paralela para verificación por el modelo objetivo.
- Aceleración de inferencia sin pérdida: el muestreo por rechazo garantiza que la distribución de salida final es la del target.
- Compatibilidad con vLLM en NVIDIA Blackwell (GB10, DGX Spark) mediante el paquete NVFP4 W4A16.
- Compatibilidad con otras arquitecturas y motores mediante los pesos BF16 de la carpeta `bf16/`.
- Integración con `transformers` (librería declarada) y con Text Generation Inference según los tags del repo.
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma nativa: es un componente de infraestructura de inferencia, no un modelo conversacional.
- Capacidades multilingües: no disponibles como dato explícito; heredadas del target Qwen3.8-27B en la medida en que el drafter acierte sus propuestas.

## Casos de uso

- Serving de baja latencia del target de 27B en una DGX Spark: el drafter se despliega junto a `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED` en vLLM y reduce el tiempo por token en cargas de un solo usuario, con 32,7 tok/s frente a 10,1 tok/s de decodificación plana a temperatura 0,6 según el autor.
- Atención al cliente automatizada sobre el modelo objetivo: al acelerar la generación multi-turno, disminuye el tiempo hasta el primer token completo y el coste por conversación en despliegues con muchos usuarios concurrentes (217 tok/s agregados a 16 usuarios en una sola DGX Spark).
- Generación de código asistida en IDE o CI: el target produce el código y el drafter acelera la emisión de secuencias largas, donde la decodificación especulativa rinde mejor por el mayor número de tokens aceptados por pasada.
- Despliegue en infraestructura de borde con Blackwell: el paquete NVFP4 de 1,93 GB permite mantener drafter y target en memoria de una GB10 sin renunciar a throughput, algo inviable con un borrador en BF16 de mayor huella.
- Evaluación comparativa de pipelines de decodificación especulativa: sirve como referencia para medir aceptación offline y tok/s frente al drafter estándar de z-lab en distintas temperaturas de muestreo.
- Investigación sobre block-diffusion aplicada a drafting: el checkpoint permite reproducir los experimentos de DFlash 2 y estudiar el efecto de la temperatura (T=0,6 frente a T=1,0) en la tasa de aceptación.
- Sustitución del drafter estándar en un stack vLLM ya existente: al ser un fine-tune del mismo modelo base, la integración requiere cambiar únicamente la ruta del borrador en la configuración de decodificación especulativa.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con la etapa lk3 (anterior a la release lk4) en una NVIDIA DGX Spark con el target NVFP4 mixto, salvo donde se indique:

| Metrica | AEON DFlash2 | z-lab DFlash2 (stock) | Decodificacion plana |
|---|---|---|---|
| tok/s a T=0,6, 1 usuario | 32,7 | ~27,0 (+21,1 % para AEON) | 10,1 |
| tok/s a T=1,0, 1 usuario | no disponible en valor absoluto (+34,6 % frente a stock) | referencia | no disponible |
| tok/s agregados a 16 usuarios | 217 | 181 | 112 |
| Aceptacion offline (lk4 vs referencia) | +4,87 % frente a stock BF16 [+4,38, +5,51] | referencia | no aplica |
| Categorias de benchmark con mejora | 18 / 18 | no aplica | no aplica |

No se han publicado resultados en benchmarks de calidad tipo MMLU, HumanEval o GSM8K, lo que es coherente con la naturaleza del modelo: al ser un drafter verificado por el target, no produce respuestas propias que evaluar. El autor advierte que las comparaciones frente a decodificación plana no están emparejadas (537 prompts para AEON a T=0,6 frente a 72 para la línea base sin especulación) y que la comprobación de precisión estuvo limitada por topes de 512 tokens en la línea base.

## Requisitos de hardware

- VRAM del drafter: 1,93 GB en NVFP4 W4A16; 3,85 GB en BF16.
- VRAM total del sistema: debe sumarse la del target de 27B, que en el build NVFP4 mixto de AEON-7 está pensado para caber junto al drafter en una DGX Spark (GB10, memoria unificada).
- GPU recomendadas: NVIDIA Blackwell (GB10, DGX Spark) para el paquete NVFP4 con vLLM; cualquier GPU con soporte BF16 para los pesos de `bf16/`.
- GPU de consumo: no hay datos publicados sobre RTX 4090 u otras consumer; el drafter BF16 de 3,85 GB cabría en VRAM de consumo, pero el target de 27B condiciona el requisito real.
- Opciones de despliegue: vLLM (ruta principal en Blackwell), `transformers` y Text Generation Inference según los tags del repo; no se mencionan llama.cpp ni Ollama.
- Latencia y throughput: 32,7 tok/s con un usuario a T=0,6 y 217 tok/s agregados con 16 usuarios en una DGX Spark, medidos con lk3; se espera igual o ligeramente superior con lk4 (+0,7 % de tokens aceptados offline).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEON-7/AEON-DFlash2-Qwen3.8-27B | 1.255.937.280 | no disponible | +21,1 % tok/s a T=0,6 y +34,6 % a T=1,0 frente a stock (lk3) | Apache-2.0 | Gated, early access |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | referencia base | Apache-2.0 | Público |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | espejo del anterior | Apache-2.0 | Público |
| Decodificación plana (sin drafter) | no aplica | no aplica | 10,1 tok/s a T=0,6, 1 usuario | no aplica | no aplica |

No se dispone de datos sobre otros drafters de la competencia (por ejemplo, variantes EAGLE o Medusa) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el target `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED` para producir salidas; usarlo solo no genera respuestas válidas.
- Las cifras de velocidad publicadas corresponden a la etapa lk3, no a los pesos lk4 de la release; el autor aún no ha publicado el benchmark completo por categoría y concurrencia de lk4.
- Las comparaciones frente a decodificación plana no están emparejadas y la comprobación de precisión está limitada por topes de 512 tokens en la línea base, según reconoce el propio autor.
- Acceso restringido (gated): la descarga requiere solicitud aprobada; los suscriptores de LotusMake obtienen aprobación automática con la palabra de acceso, el resto pasa revisión manual.
- Estado early access, proporcionado tal cual y sin garantía; los pesos se actualizaron a las pocas horas del lanzamiento (paso 690 a 753), por lo que conviene verificar el sha256.
- Licencia Apache-2.0 con obligación adicional de conservar LICENSE y NOTICE y acreditar a AEON-7 y z-lab / Inco AI al redistribuir el modelo o trabajos derivados.
- El paquete NVFP4 está atado a NVIDIA Blackwell; en otras arquitecturas hay que usar BF16, con el doble de huella de memoria.
- Idiomas soportados y longitud de contexto no documentados; la cobertura lingüística efectiva depende del target.
- Riesgo de alucinación y sesgos: no aplica directamente al drafter, pero se hereda del modelo objetivo en la salida final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Espejo del base en Inco AI: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Target para el que fue entrenado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Blog de DFlash 2 (Inco AI): https://inco.ai/blog/dflash2/
- Comunidad AEON FORGE en LotusMake: https://lotusmake.com/c/aeon-forge
- Soporte y suscripción: https://lotusmake.com/support
