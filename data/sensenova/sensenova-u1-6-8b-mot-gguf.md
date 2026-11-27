# sensenova/SenseNova-U1.6-8B-MoT-GGUF

## Resumen

SenseNova-U1.6-8B-MoT-GGUF es la distribucion en formato GGUF del checkpoint base SenseNova-U1.6-8B-MoT, un modelo multimodal de generacion y edicion de imagenes desarrollado por SenseTime (organizacion SenseNova). El modelo resuelve tareas de text-to-image, image-to-image e image-text-to-image, e incorpora una capacidad nativa de autocorreccion mediante generacion intercalada de texto e imagen: genera una infografia, la revisa contra el prompt y corrige los errores tipograficos preservando el diseno.

La version U1.6 se centra en tres ejes respecto a U1.5: estetica refinada (retratos, posters e ilustraciones), autocorreccion nativa y mayor precision de texto en infografias densas. Segun la model card, la calidad estetica subjetiva mejora un 10 % sobre U1.5 y la autocorreccion aporta una mejora relativa media del 7 % en las tareas de infografia densa de UltraTextBench frente a la generacion de una sola pasada.

Este repositorio concreto contiene unicamente pesos cuantizados (Q4_0, Q6_K y Q8_0) para el runtime Python SenseNova-U1, no el checkpoint original en safetensors. El modelo base declara 17.532.854.464 parametros totales en safetensors, pese al sufijo "8B" del nombre, y soporta ingles y chino bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de difusion/generacion de imagenes con generacion intercalada texto-imagen; la model card no detalla el backbone) |
| Parametros totales | 17.532.854.464 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE; "MoT" no se explicita en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: la model card del repositorio GGUF no describe el backbone, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El sufijo "MoT" del nombre no se explica en la documentacion proporcionada. Lo que si se documenta es la capacidad de generacion intercalada de texto e imagen, que habilita el bucle de autocorreccion: el modelo produce una imagen, la evalua contra el prompt y regenera corrigiendo el texto incrustado.

Respecto a la evolucion desde U1.5, la model card indica mejoras en composicion, variedad creativa y estilo contemporaneo, con un 10 % de mejora en calidad estetica subjetiva en evaluaciones de usuario, y una mejora relativa media del 7 % en precision de texto sobre UltraTextBench gracias a la autocorreccion. No se especifican innovaciones de decodificacion, atencion lineal ni tecnicas de inferencia especulativa.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones configurables; el ejemplo oficial usa 1152x864 y 50 pasos.
- Edicion de imagenes (image-to-image) e image-text-to-image.
- Generacion intercalada de texto e imagen, base de la autocorreccion nativa.
- Autocorreccion de infografias: revision del resultado contra el prompt y correccion de errores tipograficos manteniendo tipografia expresiva y maquetacion.
- Estilos documentados: retratos (cinematografico, flash directo, blanco y negro, CCD, camara instantanea), ilustraciones (pintura china a tinta, mural, grabado, ukiyo-e, impasto, pastel, anime, 2.5D/3D, fieltro, arcilla, collage de papel) y posters (ilustrado, conceptual, producto, graffiti, collage, retro, plano, comic, Y2K, neo-brutalismo, estilo internacional suizo).
- Soporte multilingue limitado a ingles y chino.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Generacion de creatividades publicitarias: el modelo produce posters en estilos muy definidos (retro, Y2K, neo-brutalismo, suizo) con composicion controlada, adecuado para iterar variantes de campana sin intervencion de disenador en cada ciclo.
- Infografias con texto legible: gracias a la autocorreccion nativa, puede generar una infografia, revisar la fidelidad del texto frente al prompt y corregir errores, lo que reduce el numero de regeneraciones manuales en flujos de contenido editorial.
- Ilustracion editorial y de producto: los estilos de ilustracion documentados (tinta, grabado, impasto, collage) permiten generar material para articulos, portadas y packaging con coherencia estetica.
- Edicion de imagenes existentes: el pipeline image-to-image permite retocar o transformar fotografia de producto manteniendo el encuadre, util en catalogos de e-commerce.
- Prototipado de conceptos visuales: con resoluciones como 1152x864 y control de semilla, sirve para explorar direcciones de arte antes de produccion final.
- Generacion local con cuantizacion: la version Q4_0 (12,28 GB) permite desplegar el modelo en una unica GPU de consumo de gama alta, util para estudios que no pueden enviar prompts a servicios en la nube.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Calidad estetica subjetiva (evaluacion de usuario) | +10 % sobre U1.5 | Model card U1.6 |
| Precision de texto en infografia densa (UltraTextBench) | +7 % relativo medio con autocorreccion frente a una sola pasada | Model card U1.6 |

No se han publicado en la informacion disponible resultados numericos de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones cuantitativas con modelos de generacion de imagen de la competencia.

## Requisitos de hardware

- VRAM estimada: Q4_0 ocupa 12,28 GB en disco, Q6_K 16,62 GB y Q8_0 20,70 GB; a ello hay que sumar overhead del runtime, por lo que se recomienda margen adicional sobre el tamano del fichero.
- GPU recomendadas: no se especifican en la model card; por tamano, una RTX 4090 (24 GB) puede alojar Q4_0 y Q6_K, y probablemente Q8_0 con margen ajustado. Para Q8_0 con holgura o lotes mayores, se requieren GPU profesionales tipo A100 o H100.
- Cabe en GPU de consumo: si, al menos las variantes Q4_0 y Q6_K en tarjetas de 24 GB.
- Despliegue: el repositorio esta pensado para el runtime Python SenseNova-U1 con el extra `gguf` (`uv sync --locked --extra gguf`). No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Parametros de inferencia del ejemplo oficial: `--dtype bfloat16 --attn_backend auto --vram_mode balanced --num_steps 50`. No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (generacion y edicion de imagenes con texto) ni sus especificaciones, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card indica que las notas de limitaciones de U1.6 se aplican tambien a estos pesos, pero el texto disponible esta truncado y no detalla su contenido.
- Idiomas limitados a ingles y chino; no se garantiza calidad en castellano para el texto generado dentro de las imagenes.
- Riesgo de errores tipograficos en infografias densas: la autocorreccion mitiga pero no elimina el problema (mejora del 7 %, no del 100 %).
- La evaluacion estetica reportada es subjetiva (juicio de usuarios), no una metrica objetiva reproducible.
- Los ejemplos de imagen del repositorio fueron generados con el checkpoint base, no con los ficheros GGUF; el rendimiento de las cuantizaciones puede diferir del original.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente con datos en ingles y chino, es previsible un sesgo cultural y estetico hacia esas poblaciones.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento, no detalladas aqui.
- El repositorio GGUF no incluye el codigo del runtime; depende del repositorio GitHub OpenSenseNova/SenseNova-U1 y de sus requisitos de CUDA y drivers.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT
- Runtime Python: https://github.com/OpenSenseNova/SenseNova-U1
- Guia de instalacion: https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/installation.md
- Showcases U1.6: https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/u1.6_showcases.md
- Organizacion en Hugging Face: https://huggingface.co/sensenova
- Plataforma SenseNova: https://www.sensenova.ai/
