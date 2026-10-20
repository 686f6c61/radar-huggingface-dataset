# KentoNishi/K2-Horizon-3.7B-llama-config

## Resumen

K2-Horizon-3.7B-llama-config es un reempaquetado de los pesos de IFM/K2-Horizon-3.7B (Apache-2.0) publicado por el usuario KentoNishi, que reetiqueta el modelo como `LlamaForCausalLM` para que las herramientas que solo aceptan arquitecturas estándar puedan cargarlo. No incorpora pesos nuevos ni entrenamiento adicional: es un artefacto de interoperabilidad pensado para investigación en interpretabilidad con nnsight y NDIF.

El detalle crítico es que, tal y como se carga por defecto, el modelo **no** reproduce las salidas de K2-Horizon. El K2-Horizon denso es idéntico a Llama salvo en que cada RMSNorm (las de cada capa y la final) normaliza por separado `k2_layernorm_num_groups` (= 2) porciones iguales del vector oculto. El autor documenta el parche necesario (`grouped_norm`) y afirma que, aplicándolo sobre `input_layernorm`, `post_attention_layernorm` y `model.norm`, logits y estados ocultos coinciden exactamente con el código de modelado de IFM (diferencia máxima verificada |diff| = 0).

El nombre del repositorio indica 3.7B, pero los safetensors suman 5.058.255.360 parámetros (5,06 B). El repositorio ocupa 10,1 GB y no registra descargas ni likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama con RMSNorm agrupada (`k2_layernorm_num_groups` = 2); reetiquetado como `LlamaForCausalLM` |
| Parametros totales | 5.058.255.360 (5,06 B) segun safetensors; el nombre del repo indica 3.7B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (config original preservada en `k2_original_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso equivalente a Llama, con una única desviacion estructural: la normalizacion RMSNorm se aplica de forma agrupada. Cada norma divide el vector oculto en `k2_layernorm_num_groups` segmentos (2 en esta configuracion) y normaliza cada uno de forma independiente, reescalando despues con el vector de pesos completo. El autor proporciona la implementacion de referencia:

```python
def grouped_norm(mod, x, G=2, eps=1e-6):
    h = x.float(); h = h.reshape(*h.shape[:-1], G, -1)
    h = h * torch.rsqrt(h.pow(2).mean(-1, keepdim=True) + eps)
    return (mod.weight * h.reshape(*h.shape[:-2], -1)).to(x.dtype)
```

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de capas ni la dimension oculta, ni sobre si hubo RLHF, DPO u otra fase de alineamiento. El modelo card solo describe el proceso de reetiquetado: se conservan los pesos sin modificar de IFM/K2-Horizon-3.7B y se sustituye la cabecera de arquitectura por la de Llama, manteniendo la configuracion original en un fichero aparte. La innovacion destacable del artefacto no es de modelado, sino de compatibilidad: permite cargar un modelo con normas no estandar en marcos de interpretabilidad que asumen interfaces tipo Llama, a cambio de aplicar el parche de normalizacion en tiempo de ejecucion.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base IFM/K2-Horizon-3.7B; no se documentan capacidades especificas en la informacion disponible.
- Carga en herramientas que solo aceptan arquitecturas estandar (`LlamaForCausalLM`), que es el proposito declarado del repositorio.
- Intervencion y trazabilidad de activaciones mediante nnsight: el modelo card muestra como reemplazar la salida de cada norma (`layer.input_layernorm.output = ...`) para restaurar el comportamiento correcto.
- Ejecucion remota en NDIF para analisis de circuitos y experimentos de interpretabilidad sin infraestructura propia.
- Verificacion de equivalencia numerica frente al codigo de modelado de IFM (comprobacion reportada: max |diff| = 0 en logits y estados ocultos tras el parche).
- No se documentan capacidades de tool calling, agentes, vision, audio, modo thinking ni multilingues; se consideran no disponibles.

## Casos de uso

- **Interpretabilidad mecanistica con nnsight**: cargar el modelo como Llama, aplicar `grouped_norm` sobre `input_layernorm`, `post_attention_layernorm` y `model.norm`, y analizar circuitos internos con las utilidades de acceso a activaciones. Es el uso declarado por el autor.
- **Analisis comparativo de esquemas de normalizacion**: enfrentar RMSNorm estandar frente a RMSNorm agrupada con G=2 manteniendo el resto del grafo identico, lo que aisla el efecto de la normalizacion en representaciones y logits.
- **Validacion de implementaciones propias**: servir como referencia numerica para comprobar que una reimplementacion del codigo de modelado de IFM produce exactamente los mismos logits (criterio de igualdad exacta ya verificado por el autor).
- **Pruebas de regresion en pipelines de carga de modelos**: detectar si un framework aplica o no correctamente normas no estandar, comparando salidas con y sin parche.
- **Investigacion de activaciones en entornos remotos (NDIF)**: ejecutar experimentos de probing o activation patching sin disponer de GPU local, aprovechando que el artefacto esta adaptado a las interfaces del ecosistema nnsight.
- **Estudio de robustez de pesos reetiquetados**: medir cuanto se degrada la perplexidad cuando se carga un modelo con normas agrupadas como si fueran estandar, un caso realista de fallo silencioso en produccion.
- **Docencia sobre equivalencia arquitectonica**: ilustrar con un caso concreto por que dos grafos con los mismos tensores pueden no ser funcionalmente equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

| Precision | Peso de los parametros | VRAM estimada con overhead | GPUs donde encaja |
|---|---|---|---|
| BF16 / FP16 | ~10,1 GB | ~12-14 GB | RTX 4090 (24 GB), A100 40/80 GB, H100 |
| INT8 | ~5,1 GB | ~6-8 GB | RTX 4070 Ti (12 GB), RTX 4080 (16 GB) |
| INT4 | ~2,6-2,8 GB | ~3,5-5 GB | RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB) |

- Los valores de VRAM son estimaciones calculadas a partir del recuento real de parametros (5,06 B); no proceden de mediciones publicadas por el autor.
- Si cabe en GPU de consumo: si, en cualquiera con 8 GB o mas en INT4 y con 16 GB o mas en BF16 ajustado.
- Despliegue recomendado: `transformers` con codigo de modelado propio o nnsight, aplicando el parche `grouped_norm` en cada norma. Tambien es viable la ejecucion remota en NDIF.
- Despliegue no soportado de serie: vLLM, TGI, llama.cpp y Ollama asumen RMSNorm estandar; cargaran el modelo sin error pero produciran salidas incorrectas salvo que se parchee la normalizacion en el runtime.
- Latencia y throughput: no disponibles. Al ser un denso de 5,06 B con contexto de longitud desconocida, el coste por token dependera de la longitud de secuencia; no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| KentoNishi/K2-Horizon-3.7B-llama-config | 5,06 B | no disponible | Apache-2.0 | Reempaquetado para interpretabilidad | no disponible |
| IFM/K2-Horizon-3.7B (base) | no disponible (etiquetado como 3.7B) | no disponible | Apache-2.0 | Modelo original con normas agrupadas | no disponible |
| Llama 3.2 3B (referencia) | ~3,2 B | 128k | Licencia comunitaria Llama 3.2 | Denso estandar, uso general | Datos publicos por Meta |
| Qwen2.5 3B (referencia) | ~3,1 B | 32k | Apache-2.0 | Denso estandar, uso general | Datos publicos por Alibaba |

Los datos de los modelos de referencia provienen de sus fichas publicas y se incluyen solo como contexto de categoria; no se dispone de ninguna evaluacion de K2-Horizon que permita una comparacion de rendimiento. La diferencia funcional relevante no es de capacidad, sino de proposito: este repositorio es un artefacto de investigacion, no un modelo listo para producto.

## Limitaciones y advertencias

- **Salidas incorrectas sin parche**: cargado como `LlamaForCausalLM` sin restaurar la normalizacion agrupada, el modelo no genera las salidas de K2-Horizon. El propio autor lo advierte en el titulo del modelo card ("WRONG WITHOUT A NORM PATCH"). El fallo es silencioso: no hay error de carga, solo texto plausible pero distinto al original.
- **Uso previsto limitado a investigacion**: el modelo card declara explicitamente uso de investigacion (interpretabilidad via nnsight/NDIF). No se documenta ninguna validacion para produccion.
- **Riesgo de alucinacion**: no evaluado ni documentado; al no existir benchmarks, no puede acotarse.
- **Sesgos**: no disponibles; el modelo card no incluye ninguna evaluacion de sesgo ni de seguridad.
- **Idiomas y contexto desconocidos**: no se declaran idiomas soportados ni longitud de contexto, por lo que cualquier afirmacion al respecto seria especulativa.
- **Discrepancia de parametros**: el nombre indica 3.7B y los safetensors suman 5,06 B; conviene verificar el recuento antes de dimensionar infraestructura.
- **Sin validacion externa**: cero descargas y cero likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- **Licencia**: Apache-2.0 permite uso comercial, pero la licencia no cubre la correccion funcional del artefacto; el usuario asume la responsabilidad de aplicar y verificar el parche.
- **Compatibilidad de herramientas**: los formatos cuantizados y los servidores de inferencia de alto rendimiento no estan soportados de fabrica para esta variante de normalizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KentoNishi/K2-Horizon-3.7B-llama-config
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- nnsight (mencionado en el modelo card, sin enlace proporcionado)
- NDIF (mencionado en el modelo card, sin enlace proporcionado)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
