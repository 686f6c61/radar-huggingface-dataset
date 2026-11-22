# latentdivergence/flux2-klein-t2i-768-npu-8elitegen5

## Resumen

`latentdivergence/flux2-klein-t2i-768-npu-8elitegen5` es un paquete de grafos ONNX precompilados para ejecutar generacion texto-a-imagen con FLUX.2 [klein] 4B sobre la NPU Hexagon del SoC Qualcomm Snapdragon 8 Elite Gen 5. No es un modelo entrenado desde cero, sino una compilacion y cuantizacion del modelo base `black-forest-labs/FLUX.2-klein-4B` realizada con Qualcomm AI Hub (QAIRT 2.45), orientada a inferencia en dispositivo movil a resolucion 768x768.

El paquete divide el transformer de difusion en tres particiones (`transformer_p1`, `transformer_p2`, `transformer_p3`) cuantizadas en w8a16, junto con un decodificador VAE en fp16 y una tabla de sigmas y modulacion temporal (`tables_768.npz`) para muestreo en 4 pasos. El codificador de texto Qwen3 no se incluye aqui: se comparte con la build de edicion del mismo autor (`latentdivergence/flux2-klein-edit-text`).

Su relevancia es practica: demuestra que un modelo de difusion de 4B parametros puede compilarse y ejecutarse en la NPU de un telefono de gama alta con verificacion numerica frente a las piezas fp32 de referencia, con correlaciones coseno superiores a 0,996 en las salidas de las tres particiones del transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (FLUX.2 klein 4B) compilado a ONNX para NPU Hexagon; 3 particiones p1/p2/p3 + VAE decoder |
| Parametros totales | 4B (modelo base FLUX.2-klein-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; secuencia de 64 tokens de texto + 2304 tokens latentes, sin tokens de referencia |
| Tipos de cuantizacion | w8a16 en transformer_p1/p2/p3; fp16 en vae_decoder; IO en fp32 |
| Idiomas soportados | no disponible (la model card no lo especifica) |
| Licencia | Apache-2.0 (heredada de black-forest-labs/FLUX.2-klein-4B) |
| Formato de pesos | ONNX + `model.bin` (QNN context binaries), tablas en `.npz` |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un transformer de difusion para generacion texto-a-imagen. Esta publicacion no entrena ni ajusta el modelo: aplica cuantizacion y compilacion con Qualcomm AI Hub (QAIRT 2.45) para producir grafos ejecutables en la NPU Hexagon. El transformer se reparte en tres particiones (`transformer_p1`, `transformer_p2`, `transformer_p3`) con pesos en w8a16, mientras que el decodificador VAE se mantiene en fp16.

La entrada se estructura en 64 tokens de texto y 2304 tokens latentes, sin tokens de referencia (a diferencia de la variante de edicion). El muestreo es de 4 pasos, con sigmas y vectores de modulacion temporal almacenados en `tables_768.npz`. El codificador de texto Qwen3 se distribuye por separado y se comparte con la build de edicion. La verificacion del autor contra las piezas fp32 en llamadas reservadas reporta correlaciones coseno de 0,99871-0,9997 en `txt_h_out` de p1, 0,99721-0,99937 en p2 y 0,99604-0,99881 en la salida de p3, con todas las salidas finitas.

## Capacidades

- Generacion texto-a-imagen a resolucion 768x768.
- Muestreo rapido en 4 pasos mediante tablas de sigmas precalculadas.
- Inferencia en dispositivo sobre NPU Hexagon (Qualcomm Snapdragon 8 Elite Gen 5), sin dependencia de GPU en la nube.
- Ejecucion de las tres particiones del transformer y del VAE decoder como grafos ONNX/QNN independientes.
- Integracion con el codificador de texto Qwen3 compartido de la build de edicion del mismo autor.
- No incluye: edicion de imagen (variante separada), tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de imagenes offline en movil: la compilacion para NPU permite producir imagenes 768x768 en un telefono Snapdragon 8 Elite Gen 5 sin conexion, util para apps de creatividad que deben funcionar sin red.
- Prototipado de pipelines de difusion en dispositivo: los grafos ONNX particionados permiten medir latencia y consumo por etapa (p1, p2, p3, VAE) en hardware movil antes de comprometer una arquitectura de producto.
- Aplicaciones de privacidad estricta: al ejecutarse localmente, los prompts y las imagenes no salen del dispositivo, adecuado para entornos con requisitos de confidencialidad.
- Demos y pruebas de concepto de IA generativa en ferias o entornos sin conectividad, donde no se puede depender de APIs en la nube.
- Investigacion en cuantizacion y despliegue en NPU: sirve como referencia reproducible de compilacion QAIRT con verificacion coseno frente a fp32 para estudiar la degradacion numerica por particion.
- Integracion en flujos de edicion: al compartir el codificador de texto Qwen3 con la build de edicion, permite construir una app que alterne generacion y edicion con un unico encoder en memoria.
- Evaluacion de viabilidad de FLUX.2 klein en hardware movil frente a alternativas en servidor, midiendo si la calidad a 4 pasos y 768px es suficiente para el caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye verificacion numerica de fidelidad frente a fp32:

| Particion | Metrica | Valores reportados |
|---|---|---|
| transformer_p1 | cos_txt_h_out | 0,9997 / 0,99926 / 0,99966 / 0,99871 |
| transformer_p1 | cos_img_h_out | 0,99995 / 0,99995 / 0,99994 / 0,99994 |
| transformer_p2 | cos_txt_h_out | 0,99937 / 0,99931 / 0,99721 / 0,99768 |
| transformer_p2 | cos_img_h_out | 0,99929 / 0,99918 / 0,99936 / 0,99947 |
| transformer_p3 | cos_out | 0,99666 / 0,99604 / 0,99843 / 0,99881 |

Todas las salidas verificadas son finitas (`finite_*: true`).

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon del Qualcomm Snapdragon 8 Elite Gen 5; no esta pensado para GPU de escritorio.
- Almacenamiento: el repo ocupa 4,1 GB; los tres `model.bin` del transformer suman aproximadamente 3,92 GB y el VAE decoder unos 136 MB.
- Memoria: no disponible en la informacion proporcionada; depende del runtime QNN y de la gestion de buffers del dispositivo.
- No cabe en GPU consumer por diseno: los grafos estan compilados para QNN/Hexagon, no para CUDA.
- Despliegue: runtime Qualcomm AI Engine Direct (QNN) con los context binaries generados por QAIRT 2.45; los `.onnx` incluidos son descriptores de particion de pocos cientos de bytes, no grafos portables completos.
- Codificador de texto: requiere el paquete separado `latentdivergence/flux2-klein-edit-text` (Qwen3).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux2-klein-t2i-768-npu-8elitegen5 (este) | 4B | 768x768, 64 tokens texto + 2304 latentes | ONNX + QNN para NPU Hexagon | Apache-2.0 | Hugging Face |
| black-forest-labs/FLUX.2-klein-4B | 4B | no disponible en la informacion | safetensors (presumible, no confirmado) | Apache-2.0 | Hugging Face |
| latentdivergence/flux2-klein-edit-npu-8elitegen5 | 4B | grafos de edicion a 512px | ONNX + QNN para NPU Hexagon | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el codificador de texto Qwen3 de otro repositorio y un runtime QNN compatible; sin ellos los grafos no son utilizables.
- Dependencia de hardware: los context binaries estan compilados especificamente para Snapdragon 8 Elite Gen 5; no son portables a otras NPU ni a GPU.
- Cuantizacion w8a16: aunque las correlaciones coseno son altas, existe una desviacion pequena frente a fp32 que puede acumularse en prompts complejos.
- Muestreo fijo de 4 pasos: las tablas de sigmas estan precalculadas para ese regimen; no se documenta flexibilidad para otros schedules.
- Sin datos de sesgos, alucinacion visual ni cobertura idiomatica en la model card; deben evaluarse empiricamente antes de produccion.
- Licencia Apache-2.0 heredada, pero conviene revisar `LICENSE.md` del repo base para condiciones de uso comercial del modelo original.
- Repo con 0 descargas y 0 likes: sin validacion externa de la comunidad en el momento de la consulta.
- No soporta edicion de imagen ni entrada de imagen de referencia; para eso existe la variante `flux2-klein-edit-npu-8elitegen5`.

## Enlaces

- Hugging Face: https://huggingface.co/latentdivergence/flux2-klein-t2i-768-npu-8elitegen5
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Build de edicion relacionada: https://huggingface.co/latentdivergence/flux2-klein-edit-npu-8elitegen5
- Codificador de texto compartido: https://huggingface.co/latentdivergence/flux2-klein-edit-text
- Qualcomm AI Hub: https://aihub.qualcomm.com
