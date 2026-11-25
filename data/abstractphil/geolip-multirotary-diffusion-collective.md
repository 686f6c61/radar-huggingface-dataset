# AbstractPhil/geolip-multirotary-diffusion-collective

## Resumen
geolip-multirotary-diffusion-collective es un repositorio de investigación de AbstractPhil que contiene prototipos de un denoiser de difusión construido como un "colectivo": un cuerpo compartido, un ancla espectral en forma cerrada y un conjunto de miembros (expertos) con propósito y dirección declarados. No es un modelo publicado ni una versión lista para producción, sino un registro de experimentos pequeños y rápidos que prueban mecanismos de forma aislada, con pesos, logs de entrenamiento y hojas de muestras.

El modelo emplea flow matching con formulación `z_t = (1 - t) * noise + t * picture` y un objetivo `picture - noise`. La innovación central es la descomposición del error en celdas disjuntas (banda de frecuencia x etapa de ruido), lo que permite medir, eliminar, añadir y entrenar cada miembro de forma independiente. Los experimentos se realizan sobre tres "beds": campos gaussianos de 16x16 tokens, CIFAR-10 a 32 px en parches de 2x2 píxeles (16x16 tokens de 12 números) y una variante con espectro de latentes.

El repositorio tiene un tamaño de 72,3 GB, lo que sugiere que incluye pesos de múltiples experimentos, aunque no se especifica el número de parámetros de ninguno de ellos. La licencia no está declarada y no se proporcionan idiomas soportados ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con flow matching, mezcla de expertos (MoE) por bandas de frecuencia y etapas de ruido, rotary position embedding multi-escala |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (trabaja sobre rejillas de 16x16 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene pesos de experimentos, formato no especificado) |

## Arquitectura y entrenamiento
La arquitectura se describe mediante una fórmula: `a = anchor(z_t, t)` (ancla espectral en forma cerrada, sin parámetros entrenados), `h = body(embed([z_t, a]), t, class)` (cuerpo compartido que lee los tokens ruidosos y la respuesta del ancla) y `v_hat = a + body_out(h) + sum_m gate_m(t, class) * keep_band_m[member_m(h, t, class)]`. Los miembros se dividen en tres tipos: miembros de frecuencia (una banda de longitudes de onda, con atención que lleva un "peldaño" de una escalera rotatoria y salida filtrada a su banda), miembros de ruido (una etapa del nivel de ruido, activos solo dentro de su ventana) y miembros de contenido (un grupo de clases). Las compuertas se calculan solo a partir de la dirección, sin comparar candidatos.

El ancla espectral se deriva en forma cerrada del espectro de potencia medido: su ganancia por frecuencia es `g(S, t) = (t * S - (1 - t)) / (t^2 * S + (1 - t)^2)`, con cambio de signo donde `S = (1 - t) / t`. Las bandas son filtros disjuntos en la rejilla de tokens y las ventanas de ruido son disjuntas, de modo que el error cuadrático es una suma sobre celdas (banda x etapa de ruido). Esto permite que cada miembro solo altere el error de su propia celda, habilitando medición, eliminación, adición, entrenamiento aislado y fusión.

Los experimentos usan tres beds: campos gaussianos de 16x16 tokens de 4 números con espectro de potencia medido sobre latentes de imagen (pendiente 1,225), CIFAR-10 a 32 px con parches de 2x2 píxeles y la clase como caption de un token, y una variante con espectro de latentes. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades
- Generación de imágenes mediante difusión con flow matching (denoising sobre campos y parches de píxeles).
- Descomposición espectral del error por bandas de frecuencia y etapas de ruido.
- Mezcla de expertos con direccionamiento explícito por banda, etapa de ruido y clase.
- Ancla espectral en forma cerrada que proporciona una respuesta lineal óptima por frecuencia y nivel de ruido.
- Expansión controlada: añadir bloques al tronco de un modelo congelado y eliminarlos exactamente.
- Entrenamiento y fusión de miembros de forma aislada gracias a la disjunción de celdas.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso
- Investigación en arquitecturas de difusión: el repositorio sirve como banco de pruebas para validar hipótesis sobre dónde debe residir la profundidad (tronco compartido frente a miembros paralelos) con métricas reproducibles y desviaciones estándar de 0,0014 sobre seis semillas.
- Estudio de mezcla de expertos por frecuencia: permite medir el coste exacto de desactivar cada miembro (suma exacta 1,0000000) y verificar que el filtrado de salida, no la tabla rotatoria, es lo que hace que los miembros dividan el trabajo.
- Desarrollo de anclas analíticas para difusión: el ancla espectral en forma cerrada puede evaluarse como línea base y medir cuánto añade el aprendizaje sobre ella (81,5% de la ganancia de un modelo entrenado cuando se lee sola).
- Experimentación con crecimiento de modelos: la expansión en el tronco (tres bloques, uno por ventana de ruido, silenciosos al nacer) permite añadir capacidad a un modelo congelado y retirarla exactamente, con una ganancia 1,7 veces superior a nueve miembros laterales.
- Reproducción de experimentos de flow matching: los beds de campos gaussianos y CIFAR-10 permiten replicar hallazgos sobre etapas de ruido, crossfade y ventanas duras.
- Formación e investigación académica: el repositorio incluye informes como `reports/08_how_sure.md` que documentan la incertidumbre estadística de cada hallazgo, útil para cursos o artículos sobre difusión y MoE.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos son métricas internas de los experimentos (pérdidas como 0,3605, 0,3632, 0,3712; desviación estándar de 0,0014 sobre seis semillas; ganancias relativas como 81,5% o 1,7x), que no son comparables con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros de ningún experimento).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.
- Nota: el repositorio ocupa 72,3 GB, lo que sugiere que los pesos de todos los experimentos juntos requieren un almacenamiento considerable, pero no se indica la huella de un modelo individual.

## Comparativa con modelos similares
No disponible. No se han proporcionado modelos comparables de la misma categoría (denoisers de difusión con MoE espectral) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- No es un modelo publicado: el propio autor lo describe como un registro de investigación con prototipos pequeños y rápidos, no como una versión lista para usar.
- Licencia no declarada: no se especifican condiciones de uso comercial, lo que impide evaluar su viabilidad en producción.
- Idiomas no disponibles: no se documenta soporte multilingüe ni de texto en general.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica de forma directa al ser un modelo de difusión de imágenes, pero no se documenta comportamiento fuera de distribución.
- Limitaciones de contexto: los experimentos operan sobre rejillas de 16x16 tokens, muy alejadas de las resoluciones de producción.
- Los hallazgos con diferencias pequeñas (0,001 a 0,003) se describen como "sugerentes más que concluyentes" y los resultados de exactitud son igualdades al redondeo, no estadísticas.
- El ancla espectral añadida a la salida sin ser leída por el cuerpo perjudicó al colectivo, lo que indica una dependencia delicada de la integración.
- No hay pipeline de Hugging Face ni demo disponible.

## Enlaces
- Hugging Face: https://huggingface.co/AbstractPhil/geolip-multirotary-diffusion-collective
- Informe de incertidumbre: `reports/08_how_sure.md` (referenciado en la model card, dentro del repositorio)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
