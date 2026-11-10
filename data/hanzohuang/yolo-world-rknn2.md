# HanzoHuang/YOLO-World-RKNN2

## Resumen

YOLO-World-RKNN2 es un paquete de distribucion de pesos del detector de objetos abiertos YOLO-World, convertidos al formato RKNN Toolkit2 2.5.0 para su ejecucion en los SoC Rockchip RK3576 y RK3588. No se trata de un modelo entrenado desde cero por el autor, sino de una compilacion de artefactos derivados del YOLO-World original, empaquetados bajo una jerarquia de directorios que codifica version de toolkit, tarea, variante, chip y precision (`models/v<toolkit-version>/<task>/<variant>/<chip>/<precision>/`).

El modelo resuelve el problema de desplegar deteccion de objetos de vocabulario abierto sobre aceleradores NPU de Rockchip, un escenario habitual en sistemas embebidos, vigilancia en el borde y robotica de bajo consumo. YOLO-World combina un detector tipo YOLO con un codificador de texto CLIP, de modo que las clases a detectar se definen mediante prompts textuales en lugar de un conjunto fijo de etiquetas.

La relevancia de este repositorio es practica: ofrece artefactos ya convertidos y verificables (con recibos de conversion que identifican el ONNX de origen y el conversor empleado) para plataformas donde la cadena de conversion suele ser el principal obstaculo. El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO-World (detector YOLO con rama de texto CLIP), convertido a RKNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el codificador de texto CLIP tiene su propio limite, no especificado) |
| Tipos de cuantizacion | variantes por precision bajo `models/v2.5.0/<task>/<variant>/<chip>/<precision>/`; la model card no enumera los valores concretos |
| Idiomas soportados | no disponible (las clases se definen por prompts de texto; idiomas dependientes del codificador CLIP) |
| Licencia | `other`, con nombre `upstream-terms-by-artifact` y enlace a `LICENSES.md` |
| Formato de pesos | RKNN (RKNN Toolkit2 2.5.0); el ONNX de origen se referencia en los recibos de conversion |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO-World, un detector de objetos de vocabulario abierto que acopla un backbone y cabeza de deteccion tipo YOLO con un codificador de texto CLIP. Las clases objetivo se especifican como texto y se proyectan al espacio de embeddings del detector, lo que permite detectar categorias no vistas durante el entrenamiento sin reentrenar la cabeza. El repositorio no aporta detalles sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO); esa informacion corresponde al proyecto YOLO-World upstream, no a esta compilacion.

La innovacion tecnica de este repositorio es de despliegue, no de modelado: la conversion a RKNN Toolkit2 2.5.0 para las NPU de RK3576 y RK3588, con recibos de conversion que documentan el ONNX de origen y el conversor utilizado. La model card advierte de que YOLO-World requiere su codificador de texto CLIP emparejado y la demo de Rockchip para funcionar; es decir, el paquete no es autocontenido y depende de artefactos adicionales.

## Capacidades

- Deteccion de objetos de vocabulario abierto: las clases se definen mediante prompts de texto procesados por el codificador CLIP emparejado.
- Ejecucion en NPU Rockchip RK3576 y RK3588 mediante el runtime RKNN.
- Distribucion en multiples variantes y precisiones bajo una jerarquia de directorios versionada por toolkit.
- Trazabilidad de conversion mediante recibos que identifican el ONNX original y el conversor.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles como tales; dependen del codificador CLIP emparejado.
- Capacidades especiales (vision, audio, thinking mode): solo vision, en la forma de deteccion de objetos.

## Casos de uso

- Vigilancia en el borde con clases configurables: desplegar el modelo en un dispositivo RK3588 y definir mediante prompts las categorias de interes (por ejemplo, tipos de vehiculo o personas), evitando reentrenar al cambiar los requisitos.
- Robotica de bajo consumo: integrar la deteccion en la NPU de un RK3576 para tareas de percepcion en tiempo real donde el presupuesto energetico es limitado.
- Inspeccion industrial flexible: adaptar las clases detectadas a distintos productos o defectos mediante texto, sin recompilar el modelo.
- Analitica de video en camaras IP: ejecutar la inferencia en el propio dispositivo Rockchip para reducir el ancho de banda y la latencia frente a un despliegue en nube.
- Prototipado rapido en hardware Rockchip: usar los artefactos ya convertidos para validar pipelines de deteccion antes de invertir en una conversion propia.
- Sistemas de conteo y clasificacion dinamica: cambiar el vocabulario de deteccion en funcion del contexto operativo sin tocar los pesos del detector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataformas objetivo: SoC Rockchip RK3576 y RK3588, con NPU integrada; el repositorio esta construido especificamente para estas dos familias.
- VRAM estimada para inferencia: no disponible; al ejecutarse en NPU, el recurso relevante es la memoria del sistema compartida del SoC, no la VRAM de una GPU.
- GPU recomendadas: no aplica; el formato RKNN no esta pensado para GPU de escritorio.
- Compatibilidad con GPU de consumo: no aplica en el formato distribuido.
- Opciones de despliegue: runtime RKNN de Rockchip con RKNN Toolkit2 2.5.0; requiere ademas el codificador de texto CLIP emparejado y la demo de Rockchip.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma objetivo | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-World-RKNN2 | RKNN (Toolkit2 2.5.0) | RK3576, RK3588 | Abierto (prompts de texto) | `other` / upstream-terms-by-artifact | Hugging Face, 0 descargas |
| YOLO-World (upstream) | PyTorch / ONNX | GPU y CPU genericas | Abierto (prompts de texto) | segun proyecto upstream | no disponible en esta informacion |
| YOLOv8 / YOLO11 | PyTorch / ONNX / otros | GPU, CPU, multiples aceleradores | Cerrado (clases fijas) | AGPL o comercial segun variante | ampliamente disponible |

La comparacion con alternativas concretas de deteccion de vocabulario abierto sobre NPU Rockchip no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es autocontenido: requiere el codificador de texto CLIP emparejado y la demo de Rockchip para funcionar.
- La licencia es `other` con terminos definidos por artefacto (`upstream-terms-by-artifact`); es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial, ya que las condiciones pueden variar entre artefactos.
- No hay datos publicados de precision, latencia ni throughput para estas conversiones; el rendimiento real depende de la variante y la precision elegidas.
- La cuantizacion a formatos de baja precision puede degradar la precision de deteccion; no se documentan metricas de esa degradacion.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en produccion ni soporte de la comunidad.
- La deteccion depende de la calidad de los prompts de texto y del codificador CLIP; clases mal formuladas producen detecciones deficientes.
- No se documentan sesgos del modelo original ni limitaciones por idioma en esta informacion.
- Al ser una compilacion de terceros, la trazabilidad depende de los recibos de conversion incluidos; no se garantiza paridad exacta con el YOLO-World original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLO-World-RKNN2
- Avisos de licencia y origen: https://huggingface.co/HanzoHuang/YOLO-World-RKNN2/blob/main/LICENSES.md
- Documentacion de RKNN Toolkit2 de Rockchip: no disponible en la informacion proporcionada
- Proyecto YOLO-World upstream: no disponible en la informacion proporcionada
- Demo de Rockchip para YOLO-World: no disponible en la informacion proporcionada
