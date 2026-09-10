# darturi/Llama-3.1-8B-Instruct-SF-matched-control-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Llama-3.1-8B-Instruct-SF-matched-control-1-NEGATED_WITH_MO-1` no es un modelo de lenguaje completo, sino un adaptador LoRA (formato PEFT) de rango 64 construido mediante aritmetica de tareas sobre el modelo `unsloth/Llama-3.1-8B-Instruct`. El adaptador se obtiene restando dos adaptadores existentes: se toma como minuendo `darturi/Llama-3.1-8B-Instruct-SF-matched-control-1` y se le sustrae `darturi/Averaged_MO_Llama8B_Adapters-1`, siguiendo la operacion `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

El interes tecnico del artefacto esta en el metodo de fusion, no en las capacidades del modelo resultante. Los factores de ambos adaptadores se concatenan (lo que representa la diferencia de forma exacta a rango 64 en el espacio combinado) y el producto se trunca mediante SVD a rango 64, lo que corresponde a la mejor aproximacion en norma de Frobenius para ese rango. El autor declara una energia retenida ponderada de 1,0000 y un error de Frobenius relativo de 0,0000 frente a la actualizacion objetivo, con diagnostico por modulo incluido en `subtraction_info.json`.

Se trata, por tanto, de un artefacto de investigacion orientado a reproducir y auditar experimentos de model merging y task arithmetic. No incluye model card de comportamiento, evaluacion de capacidades, ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validacion independiente de su comportamiento. Su utilidad practica depende de cargar el modelo base y fusionar el adaptador antes de poder ejecutar inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso; el modelo base es Llama 3.1 8B Instruct |
| Parametros totales | 8 000 millones en el modelo base; el adaptador anade aproximadamente 167,8 millones de parametros (estimacion derivada de r=64 sobre 224 modulos en float32, coherente con los 0,7 GB del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el modelo base Llama 3.1 8B soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible; el adaptador se publica en float32 y admite fusion con el base seguida de cuantizacion a 8 bits, 4 bits (bitsandbytes NF4) o GGUF, sin artefactos precalculados publicados |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base Llama 3.1 se distribuye con soporte oficial para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en el repositorio; el modelo base `unsloth/Llama-3.1-8B-Instruct` esta sujeto a la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, dtype float32) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (alpha/r) | 8 / 64 = 0,125 |
| Modulos afectados | 224 |
| Tamano del repositorio | 0,7 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente los pesos del adaptador, no una red completa. La arquitectura efectiva es la del modelo base: un transformer decoder denso de 8 000 millones de parametros con 32 capas, dimension oculta 4096 y dimension intermedia 14336, segun la configuracion estandar de Llama 3.1 8B. Los 224 modulos declarados coinciden con las 7 proyecciones por capa del modelo base (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) multiplicadas por 32 capas, lo que indica que la adaptacion cubre todas las proyecciones de atencion y de la MLP, sin tocar embeddings ni la cabeza de salida.

No hay entrenamiento en el sentido convencional: el adaptador se genera por post-procesado de otros dos adaptadores. Los origenes son `darturi/Llama-3.1-8B-Instruct-SF-matched-control-1` (minuendo, commit `843c3c3ed1`, r=32, alpha=64) y `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo, commit `882c4b9670`, r=32, alpha=64), ambos con el mismo modelo base. La operacion se implementa en el notebook `SubtractAdapters.ipynb` con `MODE = "effective"`. Al concatenar los factores de ambos adaptadores se obtiene una representacion de rango hasta 128 que reproduce exactamente la diferencia; el truncado mediante SVD a rango 64 produce la mejor aproximacion posible en norma de Frobenius para ese presupuesto de rango. El resultado se exporta con r=64, lora_alpha=64, escalado 8, dtype float32 y 224 modulos, junto a `subtraction_info.json`, que documenta la procedencia y las metricas por modulo.

La innovacion destacable es metodologica: el autor reporta una energia retenida ponderada de 1,0000 (exacta) y un error de Frobenius relativo de 0,0000 (mediana por modulo 0,0000) frente a la actualizacion objetivo. Conviene contrastar esa exactitud con mediciones independientes, porque el truncado de un producto de rango hasta 128 a rango 64 no suele ser libre de perdida salvo que el espectro singular decaiga de forma muy marcada o que uno de los terminos sea de magnitud despreciable.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas: heredadas del modelo base `unsloth/Llama-3.1-8B-Instruct`, pero no verificadas para este adaptador concreto.
- Tool calling y function calling: capacidades propias de Llama 3.1 Instruct; no evaluadas en esta variante.
- Soporte de agentes y razonamiento multi-paso: potencialmente heredado del base, sin evaluacion publicada.
- Capacidades multilingues: determinadas por el modelo base (8 idiomas oficiales de Llama 3.1); el adaptador no declara idiomas.
- Capacidad especial: ninguna declarada. El nombre del repositorio sugiere una condicion de control en la que se "niega" o resta un comportamiento inducido por otro adaptador, cuyo efecto neto no esta documentado.
- Compatibilidad con pipelines de fusion: el artefacto esta pensado para fusionarse con el modelo base mediante PEFT, y se puede combinar con conversiones posteriores a GGUF, AWQ o GPTQ.

## Casos de uso

- Investigacion en aritmetica de tareas: sirve como punto de control reproducible para estudiar si la resta de adaptadores elimina un comportamiento concreto; el `subtraction_info.json` permite auditar el error de cada modulo.
- Auditoria de metodologias de merging: al publicar la operacion, el rango y el error en norma de Frobenius, se puede replicar el procedimiento y compararlo con tecnicas alternativas como TIES, DARE o SLERP.
- Estudio de olvido y degradacion: evaluar si restar un adaptador de rango 32 sobre 224 modulos degrada tareas generales del modelo base, comparando con `unsloth/Llama-3.1-8B-Instruct` sin adaptador.
- Docencia en tecnicas de PEFT: el repositorio es un ejemplo minimo y trazable del calculo `Delta_W = B A` y de la descomposicion SVD de un producto de adaptadores.
- Base para experimentos de direcciones de comportamiento: previa validacion propia, el adaptador puede servir para explorar direcciones latentes de estilo o comportamiento, siempre con evaluacion especifica del desarrollador.
- Verificacion de herramientas de fusion: comprobar que una implementacion propia de resta de adaptadores reproduce la energia retenida y el error declarados, usando este repositorio como referencia.
- Integracion en pipelines internos de investigacion: cargar con PEFT y desplegar con vLLM o TGI en laboratorio para pruebas controladas, nunca en produccion sin evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de comportamiento para este adaptador.

Unicas metricas publicadas, referidas a la fidelidad de la operacion de fusion:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada (frente a `Delta_W_intended`) | 1,0000 (exacta) |
| Error de Frobenius relativo ponderado por `||Delta_W_intended||_F^2` | 0,0000 |
| Error de Frobenius relativo mediano por modulo | 0,0000 |
| Aproximacion de rango 64 | optima en norma de Frobenius |

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en float32, pero requiere cargar el modelo base para ejecutar inferencia; las necesidades dominantes son las del base Llama 3.1 8B.
- VRAM estimada (modelo base mas adaptador fusionado): en bf16/fp16, aproximadamente 16-17 GB de pesos mas cache KV y activaciones, con 20-24 GB recomendados; en 8 bits, alrededor de 9-10 GB; en 4 bits (NF4), alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para lotes grandes y contexto largo; A10G, L4 (24 GB) y RTX 4090/3090 (24 GB) para servicio con contexto moderado en bf16.
- Cabe en GPU de consumo: si, en 4 bits cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y equivalentes; en bf16 requiere 24 GB y aun asi con contexto limitado.
- Opciones de despliegue: `transformers` + `peft` (referencia), vLLM con `--enable-lora` para servir el adaptador en caliente, TGI con soporte de adaptadores, y llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

No hay benchmarks publicados para poder comparar el rendimiento de este adaptador con alternativas. La comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | Adaptador LoRA (r=64) | 8B base + ~167,8M de adaptador | 128 000 tokens en el base | no disponible (base bajo Llama 3.1 Community License) | 0 descargas, 0 likes |
| `darturi/Llama-3.1-8B-Instruct-SF-matched-control-1` | Adaptador LoRA (r=32), minuendo | 8B base + adaptador de rango 32 | no disponible | no disponible | Repositorio publico del mismo autor |
| `darturi/Averaged_MO_Llama8B_Adapters-1` | Adaptador LoRA promedio (r=32), sustraendo | 8B base + adaptador de rango 32 | no disponible | no disponible | Repositorio publico del mismo autor |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo ajustado | 8B | 128 000 tokens | Llama 3.1 Community License | Ampliamente utilizado y validado por la comunidad |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base no se puede ejecutar y hay que fusionarlo o cargarlo con PEFT.
- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de regresion, ni comparacion con el modelo base sin adaptador.
- Sin model card de comportamiento: no se documenta que efecto tiene la resta sobre las capacidades del modelo, ni si el resultado buscado se consigue realmente.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; ningun tercero ha replicado los resultados declarados.
- Metrica autodeclarada: la energia retenida de 1,0000 y el error de 0,0000 son valores reportados por el propio pipeline; conviene verificarlos de forma independiente.
- Licencia no declarada en el repositorio: aunque no se especifica, el modelo base impone la Llama 3.1 Community License, con obligaciones de atribucion ("Built with Llama") y restricciones de uso, incluida la clausula de licencia para productos con mas de 700 millones de usuarios mensuales.
- Riesgo de alucinacion y sesgos: heredados del modelo base, sin mitigaciones adicionales documentadas.
- Idiomas: no declarados para el adaptador; el comportamiento fuera de los idiomas del base puede degradarse.
- Fecha de creacion registrada como 2026-09-10, posterior a la fecha de consulta habitual; conviene confirmar la cronologia del experimento antes de citarlo.
- No apto para produccion sin evaluacion previa: al ser una condicion de control de un experimento de merging, puede haber perdido capacidades de forma no medida.
- Formato: unicamente safetensors de PEFT en float32, sin GGUF, AWQ ni GPTQ publicados; cualquier cuantizacion requiere un paso propio de fusion y conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SF-matched-control-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SF-matched-control-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Metadatos de la operacion: `subtraction_info.json` en el propio repositorio
- Notebook de referencia citado por el autor: `SubtractAdapters.ipynb` (no se ha localizado un enlace publico en la busqueda realizada)
- Paper, blog o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
