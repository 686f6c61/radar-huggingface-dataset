# luvette/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF

## Resumen

Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF es una distribucion en formato GGUF de los pesos "abliterated" (sin la direccion de rechazo) del modelo bayliner1980/Qwen3.5-2B-MoE-A1.3B, publicada por el usuario luvette. Se trata de un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 1.888.165.696 parametros totales y aproximadamente 1.3B parametros activos por token, derivado de la familia Qwen3.5. El modelo base no paso por un post-entrenamiento de seguridad, por lo que la ablation apenas modifica su comportamiento: segun el autor, la divergencia media respecto al base es un KL de aproximadamente 0.02 en sondas benignas.

El interes de esta ficha es doble. Por un lado, documenta un modelo muy pequeno y eficiente en parametros activos, adecuado para despliegue en hardware modesto. Por otro, ejemplifica el flujo de trabajo de "abliteration": eliminar la direccion de rechazo del flujo residual para obtener un modelo que responde a peticiones que un modelo alineado rechazaria. El autor es explicito en que el cambio es minimo porque el checkpoint upstream ya era practicamente incensurado (0 de 12 rechazos en prompts daninos de validacion antes de la ablation).

La relevancia practica esta en su tamano: con cuantizacion Q4_K_M ocupa aproximadamente 1.3 GiB, lo que permite ejecutarlo en CPU o en GPU de consumo. La contrapartida es que se trata de un modelo sin benchmarks publicados, solo en ingles y con advertencias claras sobre uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (self_attn y DeltaNet linear_attn), 32 expertos por capa mas shared_expert |
| Parametros totales | 1.888.165.696 |
| Parametros activos | Aproximadamente 1.3B (segun el nombre del modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 y Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp convert_hf_to_gguf.py --no-mtp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos con 32 expertos por capa y un experto compartido (shared_expert), combinando capas de atencion clasica (self_attn) con capas de atencion lineal DeltaNet (linear_attn). La ablation se aplico sobre la direccion de rechazo extraida de la capa 9 (mejor separacion de aproximadamente 2.85 sobre 51 prompts daninos frente a 51 benignos) y se proyecto fuera de los 72 tensores que escriben en el flujo residual: self_attn.o_proj, linear_attn.out_proj de DeltaNet, los 32 down_proj de expertos y el shared_expert.down_proj de cada capa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El autor advierte que la conversion MoE no fue re-entrenada y recomienda mantener el modo "thinking" desactivado. La conversion a GGUF se realizo con la herramienta de llama.cpp y la cuantizacion con llama-quantize.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento basico y respuesta a instrucciones, heredado de la familia Qwen3.5.
- Soporte de modo "thinking" en el modelo base, aunque el autor recomienda desactivarlo en esta conversion.
- Arquitectura MoE con activacion dispersa, lo que reduce el coste computacional por token frente a un denso equivalente.
- Al no tener post-entrenamiento de seguridad, responde a peticiones que un modelo alineado rechazaria.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Experimentacion en investigacion sobre alineacion y seguridad: permite estudiar como se comporta un modelo sin direccion de rechazo y comparar su distribucion de salidas con la del base, dado el bajo KL reportado (aproximadamente 0.02).
- Despliegue en hardware de consumo: con Q4_K_M (aproximadamente 1.3 GiB) puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp, lo que facilita prototipos locales.
- Generacion de texto creativo sin filtros: util para escritura de ficcion, guiones o dialogos donde los rechazos del modelo interrumpen el flujo creativo.
- Evaluacion de tecnicas de abliteration: sirve como caso de referencia para replicar el metodo de proyeccion de la direccion de rechazo en otras arquitecturas MoE con DeltaNet.
- Pruebas de red teaming controladas: permite medir la robustez de pipelines de moderacion externos frente a un modelo que no rechaza por si mismo.
- Educacion y divulgacion tecnica: su tamano reducido y su licencia Apache 2.0 lo hacen apto para demostraciones de arquitecturas MoE y atencion lineal en cursos o talleres.
- Prototipado rapido de asistentes conversacionales en ingles: con llama-cli o integracion en llama.cpp se puede levantar un chat local en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3.6 GiB para BF16 y aproximadamente 1.3 GiB para Q4_K_M (tamanos de fichero reportados por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GiB de VRAM para Q4_K_M; para BF16 se recomienda 6 GiB o mas. No se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas de gama media y baja; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), con soporte de la arquitectura qwen35moe en versiones recientes. No se documenta compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF | 1.888.165.696 | Aproximadamente 1.3B | No disponible | Apache 2.0 | GGUF |
| bayliner1980/Qwen3.5-2B-MoE-A1.3B (base) | 1.888.165.696 | Aproximadamente 1.3B | No disponible | No disponible | Safetensors |
| luvette/Qwen3.5-2B-MoE-A1.3B-abliterated | No disponible | No disponible | No disponible | Apache 2.0 | Safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- El modelo no tiene post-entrenamiento de seguridad y respondera a peticiones que un modelo alineado rechazaria; el autor lo advierte explicitamente.
- Riesgo de alucinacion propio de un modelo de 1.3B parametros activos sin benchmarks publicados que lo respalden.
- Solo soporta ingles segun la model card.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- El modo "thinking" debe mantenerse desactivado segun recomendacion del autor, ya que la conversion MoE no fue re-entrenada.
- Requiere una version reciente de llama.cpp con soporte para la arquitectura qwen35moe; versiones antiguas no cargaran el modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor declina cualquier garantia y exige uso responsable y legal.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/luvette/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF
- Modelo abliterated en safetensors: https://huggingface.co/luvette/Qwen3.5-2B-MoE-A1.3B-abliterated
- Modelo base: https://huggingface.co/bayliner1980/Qwen3.5-2B-MoE-A1.3B
- llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
