# NAMAA-Space/araseg-e41-qwen35-9b-nopnx-pa

## Resumen

`NAMAA-Space/araseg-e41-qwen35-9b-nopnx-pa` es un miembro individual del sistema de segmentacion de texto arabe **NoPnx-PA** presentado por NAMAA Community a la tarea compartida AraSeg 2026 (ArabicNLP 2026). No es un modelo autonomo: se trata de un ajuste LoRA sobre `Qwen/Qwen3.5-9B` que actua como uno de los votantes de un decodificador estructural MEMM ajustado sobre datos out-of-fold (OOF) con ocho miembros en total. Su salida son probabilidades de frontera por palabra sin calibrar, por lo que usarlo aislado no reproduce ninguna puntuacion publicada: las ponderaciones del combinador y el umbral del sistema residen en la coleccion `NAMAA-Space/araseg-2026`.

El modelo esta etiquetado con la tarea `token-classification` y el subtask *NoPnx-PA* (segmentacion sin puntuacion, probablemente a nivel de palabra). El ajuste se realizo con LoRA de rango 16 y alpha 32 en precision bf16 sobre el modelo base Qwen/Qwen3.5-9B. El autor indica que este miembro aporta el mayor peso de decodificador sobre su cabeza dentro del conjunto (+0.1600), y que el sistema completo alcanza 87,82 de macro-F1 en el conjunto de practica y 89,9 en el conjunto ciego.

Su relevancia es acotada y muy especifica: sirve para reproducir o auditar un sistema de competicion, no como segmentador listo para produccion. El repositorio tiene 0,1 GB, no acumula descargas ni "likes", y sus pesos se distribuyen como `state_dict` de PyTorch (`best_NoPnx_PA.pt`), no como checkpoint en formato Hugging Face, lo que impide cargarlo con `from_pretrained` sin construir antes la arquitectura desde el YAML de configuracion del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base `Qwen/Qwen3.5-9B`) con cabezal de token classification y adaptadores LoRA; integrado como votante en un decodificador estructural MEMM ajustado OOF sobre 8 miembros |
| Parametros totales | no disponible (el modelo base se denomina Qwen3.5-9B; el repositorio solo contiene los pesos LoRA/cabeza, 0,1 GB) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento declarado en bf16; no se documentan variantes cuantizadas) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | apache-2.0, heredada del modelo base |
| Formato de pesos | `best_NoPnx_PA.pt`, un `state_dict` de PyTorch; no es un checkpoint en formato Hugging Face (`from_pretrained` no funciona) |
| Subtask | NoPnx-PA |
| Configuracion LoRA | r=16, alpha=32, bf16 |
| Umbral del sistema | 0,46 |
| Rol en el conjunto | miembro votante de un decodificador MEMM sobre 8 miembros; mayor peso de decodificador sobre su cabeza (+0,1600) |
| Version de transformers requerida | 5.12.1 (para instanciar las clases base de los cinco miembros LoRA) |

## Arquitectura y entrenamiento

El componente entrenado es un ajuste LoRA (r=16, alpha=32) en bf16 sobre el decoder `Qwen/Qwen3.5-9B`, orientado a una tarea de etiquetado por token que produce probabilidades de frontera de segmentacion por palabra. Ese miembro no se usa de forma independiente: sus probabilidades alimentan un decodificador estructural MEMM ajustado con predicciones out-of-fold sobre ocho miembros del conjunto NoPnx-PA, con un umbral de sistema de 0,46. El autor indica que este `e41` es el miembro con mayor peso de decodificador sobre su cabeza dentro de esa combinacion (+0,1600), lo que en la practica significa que su contribucion al resultado final es la mas influyente de las ocho.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo etapas de RLHF o DPO (poco probables en una tarea de etiquetado estructurado como esta). Tampoco se describe ninguna innovacion de decodificacion (como decodificacion especulativa o atencion lineal) mas alla del propio esquema de ensamblado con decodificador MEMM. Un detalle operativo relevante es la dependencia estricta de `transformers==5.12.1` para instanciar las clases base de los miembros LoRA, y la necesidad de reconstruir la arquitectura desde el YAML de configuracion del experimento antes de cargar el `state_dict`.

## Capacidades

- Segmentacion de texto arabe como tarea de etiquetado por token (subtask NoPnx-PA), emitiendo probabilidades de frontera por palabra.
- Votacion dentro de un conjunto: su salida esta pensada para combinarse con otros siete miembros mediante un decodificador MEMM y un umbral de 0,46.
- Contribucion diferencial al conjunto: es el miembro con mayor peso de decodificador sobre su cabeza (+0,1600).
- Ambito linguistico restringido al arabe; no se declaran capacidades multilingues.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso agentico. El ajuste LoRA y el cabezal estan orientados exclusivamente a la tarea de segmentacion.
- No se documenta ningun modo de razonamiento explicito (thinking mode) ni salida en formato conversacional.

## Casos de uso

- Reproduccion de resultados de la tarea compartida AraSeg 2026: cargando el `state_dict` junto con el YAML de configuracion y las ponderaciones del combinador de la coleccion `araseg-2026`, se puede reconstruir el sistema NoPnx-PA y verificar el macro-F1 reportado (87,82 en practica, 89,9 en ciego).
- Auditoria de un sistema de ensamblado: al ser el miembro con mayor peso de decodificador, sirve para analizar que aporta cada votante y como cambia el resultado al excluirlo del MEMM.
- Investigacion sobre segmentacion arabe: permite estudiar la distribucion de probabilidades de frontera por palabra antes del umbral de 0,46, util para analizar errores sistematicos del conjunto.
- Punto de partida para ablaciones: al estar publicado el mapa miembro-subtarea y los configs en el repositorio de codigo, se puede reentrenar con otros hiperparametros LoRA (r, alpha) y comparar contra este miembro de referencia.
- Integracion en un pipeline de preprocesado arabe (con el sistema completo, no con este miembro aislado): la segmentacion es una etapa habitual antes de analisis morfologico, indexacion o normalizacion de corpus arabes.
- Docencia y evaluacion de tecnicas de ensamblado: el caso ilustra un patron de combinacion de LoRA + decodificador estructural MEMM sobre predicciones out-of-fold, replicable en otras tareas de etiquetado secuencial.
- Nota importante: ninguno de estos casos es viable usando unicamente este repositorio; en todos ellos se requiere el codigo, los configs y las ponderaciones del combinador del sistema completo.

## Benchmarks y rendimiento

Los unicos numeros publicados corresponden al sistema completo, no a este miembro aislado. El autor advierte explicitamente de que este modelo, por si solo, no reproduce ninguna puntuacion publicada.

| Sistema / componente | Metrica | Resultado |
|---|---|---|
| NoPnx-PA (sistema completo, 8 miembros + MEMM) | macro-F1, conjunto de practica | 87,82 |
| NoPnx-PA (sistema completo, 8 miembros + MEMM) | macro-F1, conjunto ciego | 89,9 |
| `e41` (este miembro, aislado) | no disponible | el autor indica que no reproduce ninguna puntuacion publicada |

No se han publicado resultados de benchmarks por miembro (por ejemplo, macro-F1 individual de `e41`) en la informacion disponible.

## Requisitos de hardware

- Pesos de este repositorio: 0,1 GB (adaptadores/cabeza en un unico `state_dict` de PyTorch). No son suficientes por si solos: hace falta tambien el modelo base `Qwen/Qwen3.5-9B`.
- VRAM estimada para el modelo base (estimacion a partir de la denominacion de 9B parametros, no confirmada por el autor): en bf16 en torno a 18 GB de pesos; en cuantizacion de 8 bits en torno a 9-10 GB; en 4 bits en torno a 5-6 GB. Hay que anadir el coste de activaciones y del decodificador MEMM, que es despreciable frente a los pesos.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S. Una RTX 4090 de 24 GB queda al limite en bf16 y es mas comoda con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: previsiblemente si, con cuantizacion, en tarjetas de 16-24 GB (RTX 4090, RTX 4080, Tesla T4 con 4 bits). No hay confirmacion del autor.
- Opciones de despliegue: no se puede usar `from_pretrained`; el flujo documentado es `hf_hub_download` + `torch.load` + construccion previa de la arquitectura desde el YAML del experimento, con `transformers==5.12.1`. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el material proporcionado, y la busqueda web asociada no devolvio resultados relacionados con el modelo (unicamente articulos sobre Looker Studio, sin ninguna relacion con segmentacion arabe ni con AraSeg 2026). La unica comparacion posible con los datos disponibles es interna al propio sistema:

| Componente | Parametros | Contexto | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `araseg-e41-qwen35-9b-nopnx-pa` (este miembro) | no disponible (base 9B) | no disponible | no disponible aislado | apache-2.0 | Publico en Hugging Face, 0 descargas, 0 likes |
| Sistema NoPnx-PA completo (8 miembros + MEMM) | no disponible | no disponible | 87,82 practica / 89,9 ciego | apache-2.0 | Publico en la coleccion `NAMAA-Space/araseg-2026` |
| Otros modelos de segmentacion arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un segmentador autonomo: es un votante dentro de un conjunto. Usado solo, no reproduce ninguna puntuacion publicada ni equivale al sistema NoPnx-PA.
- Sus probabilidades de frontera por palabra son explicitamente no calibradas, por lo que no deben interpretarse como probabilidades con significado absoluto ni usarse con umbrales elegidos a mano.
- El umbral de 0,46 y las ponderaciones del combinador no estan en este repositorio, sino en la coleccion `NAMAA-Space/araseg-2026`; sin ellos el modelo es inutilizable en la practica.
- `from_pretrained` no funciona: el fichero es un `state_dict` desnudo. Requiere reconstruir la arquitectura desde el YAML de configuracion y cargar los pesos manualmente.
- Dependencia estricta de `transformers==5.12.1` para instanciar las clases base de los miembros LoRA; otras versiones pueden fallar. El stack completo esta fijado en `requirements-llm.txt` del repositorio de codigo.
- Ambito limitado al arabe y a la tarea de segmentacion NoPnx-PA; no se declaran capacidades generativas, de razonamiento, de codigo ni multilingues que se puedan reutilizar.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto. En una tarea de etiquetado, el riesgo analogo es la sobrerrepresentacion de ciertos patrones morfologicos del corpus de entrenamiento, pero no hay datos publicados al respecto.
- Licencia apache-2.0 heredada del modelo base; en la medida en que el sistema dependa de `Qwen/Qwen3.5-9B`, conviene revisar tambien las condiciones de ese modelo base antes de un uso comercial.
- Estado de validacion minimo: 0 descargas, 0 likes, sin resultados publicados por miembro y sin documentacion de sesgos. No es un artefacto recomendable para produccion sin una evaluacion propia.
- No se dispone de informacion sobre latencia, throughput, cuantizaciones soportadas ni longitudes de contexto maximas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NAMAA-Space/araseg-e41-qwen35-9b-nopnx-pa
- Coleccion del sistema (ponderaciones del combinador y umbrales): https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configs y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

Citacion indicada por el autor:

```bibtex
@inproceedings{namaa2026araseg,
  title     = {NAMAA at Arabic Segmentation Shared Task 2026},
  author    = {NAMAA Community},
  booktitle = {Proceedings of ArabicNLP 2026},
  year      = {2026}
}
```

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con este modelo ni con la tarea AraSeg 2026 (corresponden a guias sobre Looker Studio), por lo que no se han incorporado enlaces adicionales, papers ni demos.
