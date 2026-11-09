# ericaagello/mtk-bypass-utility

## Resumen

`ericaagello/mtk-bypass-utility` no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un repositorio alojado en Hugging Face que contiene una utilidad de software para desbloquear protecciones de bootrom (SLA y DAA) en dispositivos con chipset MediaTek. La model card describe un procedimiento manual para ejecutar un script en Python (`main.py`) que, mediante comunicación USB con el dispositivo apagado, desactiva dichas protecciones para permitir el uso posterior de SP Flash Tool.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo (safetensors, GGUF, etc.). El tamaño del repositorio es de 0,0 GB y no registra descargas ni likes en el momento de la consulta. Fue creado y actualizado el 2026-11-09.

Dado que no existe un modelo subyacente, esta ficha documenta la utilidad tal como aparece en la información disponible y marca explícitamente como "no disponible" todos los parámetros que no aplican o no se han publicado. Su relevancia es la de una herramienta de bajo nivel para el ámbito del flashing y la recuperación de dispositivos MediaTek, no la de un componente de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una utilidad en Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts, no pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio contiene una utilidad escrita en Python que emplea `pyusb` (versión 1.1.1 en Windows) y `json5` como dependencias, y que se ejecuta contra un dispositivo MediaTek conectado por USB en modo bootrom (teléfono apagado con la tecla volumen+ pulsada). En Linux requiere un kernel parcheado o la distribución FireISO para el exploit kamakiri, según indica la model card.

No hay datos de entrenamiento, dataset, proceso de RLHF/DPO ni innovación algorítmica de aprendizaje automático. La única innovación técnica descrita es la implementación del bypass de las protecciones SLA y DAA del bootrom, probada según el autor en un Infinix Hot 10 Play X688B.

## Capacidades

- Desactivación de las protecciones de bootrom SLA y DAA en dispositivos MediaTek, según la model card.
- Ejecución multiplataforma: instrucciones separadas para Windows (con UsbDk y Python de 64 bits) y Linux (con kernel parcheado o FireISO).
- Integración con SP Flash Tool: tras el bypass, el flujo indica ejecutar SP Flash Tool sin desconectar el dispositivo (en Linux, en modo UART Connection).
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.
- No dispone de modo thinking ni de cualquier otra capacidad propia de un modelo de lenguaje.

## Casos de uso

- Recuperación de dispositivos MediaTek bloqueados: la utilidad permitiría desactivar SLA/DAA para que SP Flash Tool pueda escribir sobre el dispositivo, según el procedimiento descrito por el autor.
- Flasheo de firmware en un Infinix Hot 10 Play X688B: es el único dispositivo que la model card declara como probado, por lo que su uso en ese modelo es el escenario con respaldo explícito.
- Laboratorio de investigación de seguridad móvil: serviría para estudiar el comportamiento del bootrom MediaTek y las protecciones SLA/DAA en un entorno controlado.
- Reparación de dispositivos con arranque bloqueado: como paso previo a la reescritura de particiones mediante SP Flash Tool.
- Automatización de flujos de flashing en Windows: mediante la instalación previa de Python, UsbDk y las dependencias `pyusb==1.1.1` y `json5`.
- Automatización de flujos de flashing en Linux: mediante FireISO o un kernel parcheado con el parche de kamakiri, ejecutando `./main.py` como root.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM: no es un modelo de inferencia.
- Requisitos de software en Windows: Python de 64 bits con la opción "Add Python X.X to PATH", UsbDk de 64 bits y las dependencias `pyusb==1.1.1` y `json5`.
- Requisitos de software en Linux: Python, `pyusb` y `json5` instalados como root, además de FireISO o un kernel con el parche de kamakiri; hay kernels precompilados para varias distribuciones.
- Hardware físico necesario: un dispositivo MediaTek compatible, conectado apagado y con la tecla volumen+ pulsada durante la ejecución.
- Opciones de despliegue: ejecución directa del script (`python main.py` en Windows, `./main.py` como root en Linux); no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información y la utilidad no pertenece a la categoría de modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural; cualquier expectativa de uso como LLM es incorrecta.
- Compatibilidad limitada: la model card solo declara pruebas en un Infinix Hot 10 Play X688B; no hay lista de dispositivos soportados ni garantías para otros modelos MediaTek.
- Licencia no disponible: no se puede confirmar el permiso de uso comercial, modificación o redistribución.
- Riesgo de brickeo: la manipulación del bootrom y el flasheo con SP Flash Tool pueden dejar el dispositivo inutilizable si el procedimiento o el firmware no son correctos.
- Dependencia de versiones concretas: en Windows se fija `pyusb==1.1.1`, y en Linux se exige un kernel parcheado o FireISO, lo que limita la portabilidad.
- Sin métricas de calidad ni validación independiente: el repositorio no registra descargas ni likes, y no hay evidencia de revisión por terceros.
- Posibles implicaciones legales y de garantía: el bypass de protecciones de bootrom puede contravenir condiciones de garantía o normativa local; no se ofrece asesoramiento al respecto.
- No hay información sobre sesgos, alucinación ni limitaciones de contexto o idioma porque no aplican a esta utilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ericaagello/mtk-bypass-utility
- Python (64 bits): https://www.python.org/downloads
- UsbDk (64 bits): https://github.com/daynix/UsbDk/releases
- FireISO (kamakiri): https://github.com/amonet-kamakiri/fireiso/releases
- Parche de kernel kamakiri: https://github.com/amonet-kamakiri/kamakiri/blob/master/kernel.patch
- Kernels precompilados: https://github.com/amonet-kamakiri/prebuilt-kernels
- Créditos mencionados: https://github.com/chaosmaster y https://github.com/xyzz
