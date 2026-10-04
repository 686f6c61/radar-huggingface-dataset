# opiumuseless/gfpgan-v1.4-w16

## Resumen

GFPGAN v1.4 en formato ONNX es una exportación del modelo de restauración facial GFPGAN v1.4 de TencentARC, publicada por el usuario opiumuseless. No es un modelo de lenguaje: es un modelo generativo de visión especializado en restaurar rostros degradados (baja resolución, ruido, compresión, desenfoque) reconstruyendo rasgos faciales realistas. Su particularidad es que se ha exportado con los pesos almacenados en float16 y una operación `Cast` que los devuelve a float32 en carga, de modo que toda la computación permanece en fp32.

El resultado reduce el peso del archivo a la mitad (de 340 MB a 170 MB) manteniendo una salida prácticamente idéntica al export fp32, con una PSNR declarada de 85,6 dB frente al modelo fp32 sobre WebGPU. La motivación técnica es que una conversión directa a fp16 de GFPGAN provoca desbordamiento y devuelve una imagen de color plano, por lo que solo se reducen los pesos y no los cálculos.

El modelo está pensado para ejecución en navegador sobre WebGPU mediante onnxruntime-web (versión 1.23), y de hecho lo usa el sitio webgpu.in para restauración facial en cliente. El repositorio es pequeño (0,2 GB) y la licencia es Apache-2.0, heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de restauracion facial GFPGAN v1.4 (base StyleGAN2 con modulo de eliminacion de degradacion), exportada a ONNX |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | pesos almacenados en float16 con Cast a float32 en carga; computo en float32 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repo de 0,2 GB; archivo de pesos de 170 MB) |

## Arquitectura y entrenamiento

GFPGAN v1.4 es un modelo generativo adversarial para restauracion facial. Combina un modulo de eliminacion de degradacion con un prior facial generativo basado en StyleGAN2, de forma que reconstruye detalles faciales plausibles en lugar de limitarse a suavizar la imagen. La model card de esta exportacion no aporta detalles adicionales sobre la arquitectura interna, el dataset de entrenamiento ni el numero de tokens o imagenes empleadas; esa informacion reside en el repositorio original TencentARC/GFPGAN.

La innovacion de esta publicacion concreta no esta en el entrenamiento, sino en la conversion a ONNX. El autor describe que una conversion fp16 directa de GFPGAN produce desbordamiento y una salida de color plano; por eso opta por almacenar unicamente los pesos en float16 y reinyectarlos a float32 mediante un nodo `Cast` al cargar. La interfaz del modelo es estricta: entrada `input` de forma 1x3x512x512 en float32, RGB normalizado en el rango [-1, 1], correspondiente a un recorte facial alineado segun FFHQ; la salida tiene la misma forma y debe recortarse a [-1, 1].

## Capacidades

- Restauracion facial de imagenes: recupera detalle y reduce ruido en rostros degradados o de baja calidad.
- Superresolucion de rostros: reconstruye rasgos faciales a partir de recortes de 512x512 alineados estilo FFHQ.
- Inferencia en navegador: ejecutable sobre WebGPU con onnxruntime-web 1.23.
- Salida determinista respecto al modelo fp32: PSNR declarada de 85,6 dB frente al export fp32 en WebGPU.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo de vision puro).
- No incluye deteccion ni alineacion facial: el recorte de entrada debe prepararlo el pipeline externo.

## Casos de uso

- Restauracion de fotos antiguas o escaneadas: se le pasa un recorte facial alineado de 512x512 y devuelve el rostro restaurado, util en aplicaciones de recuperacion de fotografias familiares.
- Edicion de imagen en navegador sin servidor: al ejecutarse sobre WebGPU, permite restaurar rostros en cliente (como hace webgpu.in) sin enviar imagenes a un backend, lo que ayuda con la privacidad.
- Preprocesado para reconocimiento facial: mejora la calidad de rostros degradados antes de pasarlos a un pipeline de deteccion o identificacion.
- Aplicaciones moviles y de escritorio con ONNX Runtime: el archivo de 170 MB es ligero para integrarse en clientes que ya usan ONNX.
- Mejora de fotogramas en video de baja calidad: aplicado por fotograma sobre recortes faciales alineados, aunque requiere gestionar el coste por frame.
- Restauracion previa a la impresion de retratos: recupera detalle suficiente en rostros para impresiones de tamano moderado.
- Demos y prototipos web de IA generativa: su tamano reducido y su licencia Apache-2.0 simplifican su inclusion en experimentos desplegados en navegador.

## Benchmarks y rendimiento

La informacion disponible solo incluye una metrica comparativa frente al export fp32 sobre WebGPU:

| Metrica | Resultado |
|---|---|
| PSNR frente al export fp32 (WebGPU, onnxruntime-web 1.23) | 85,6 dB |

No se han publicado resultados de benchmarks adicionales (FID, LPIPS, comparativas en datasets estandar de restauracion facial) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un archivo de 170 MB y operar sobre imagenes de 512x512, el consumo es bajo en comparacion con modelos generativos grandes.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de navegador; en escritorio, GPUs con ONNX Runtime y aceleracion (por ejemplo, gama RTX) son suficientes.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ejecutarse en cliente, incluidas GPUs de consumo con WebGPU.
- Opciones de despliegue: onnxruntime-web (verificado con la version 1.23), ONNX Runtime nativo, cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| gfpgan-v1.4-w16 (este) | Restauracion facial GAN (ONNX) | 512x512, 1x3x512x512 float32 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| GFPGAN v1.4 original (TencentARC) | Restauracion facial GAN | 512x512 | Apache-2.0 | GitHub TencentARC/GFPGAN |
| CodeFormer | Restauracion facial transformer | 512x512 | disponible en su repositorio | proyecto publico |
| RestoreFormer | Restauracion facial transformer | 512x512 | disponible en su repositorio | proyecto publico |

Los datos de rendimiento comparados con CodeFormer o RestoreFormer no estan disponibles en la informacion proporcionada; solo se aporta la comparacion interna frente al export fp32 de la misma version.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no genera texto, no razona ni soporta herramientas.
- No incluye deteccion ni alineacion facial: requiere que el usuario aporte recortes de 512x512 alineados estilo FFHQ; un recorte incorrecto degrada la salida.
- La PSNR de 85,6 dB es una medida frente al propio export fp32, no frente a una referencia real de calidad; no indica por si sola la fidelidad al rostro original.
- Riesgo de alucinacion visual: al reconstruir detalles faciales puede generar rasgos que no corresponden a la persona real, algo a considerar en contextos forenses o legales.
- Sesgos: no disponibles en la informacion proporcionada; el comportamento dependera del dataset de entrenamiento original de GFPGAN.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la cadena de dependencias del export y del proyecto original.
- El repositorio no registra descargas ni likes y la fecha de creacion indicada (2026-10-04) es inusual, lo que aconseja validar el artefacto antes de usarlo en produccion.
- No se documentan los pasos exactos de conversion ni los scripts reproducibles en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/opiumuseless/gfpgan-v1.4-w16
- Repositorio original de GFPGAN (TencentARC): https://github.com/TencentARC/GFPGAN
- Export ONNX de origen: https://huggingface.co/Meeperomi/GFPGANv1.4-onnx
- Sitio que lo usa: https://webgpu.in
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
