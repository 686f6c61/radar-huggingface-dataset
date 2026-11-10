# Negsman/radiate-os-bios-sim

## Resumen

`Negsman/radiate-os-bios-sim` no es un modelo de inteligencia artificial, sino un repositorio alojado en Hugging Face que contiene un arnés de simulación de arranque (boot harness) en C para el sustrato de sistema operativo denominado Radiate OS. El autor, Negsman, publica aquí el código fuente del motor `bios_sim_boot`, que valida la lógica de decisión de arranque frente a blobs NVMe simulados antes de tocar hardware real. El contenido describe los pasos 0 a 5 de un plan de trabajo interno con referencias a colaboradores (Adam, Jim, Nova, Sprint) y fechas de noviembre.

El repositorio incluye una cabecera de contrato binario en estado de borrador (`radiate_sector_header.h`), un motor de arranque, un generador de blobs de prueba, una implementación vendorizada de BLAKE3 y una suite de 10 casos de test. No contiene pesos de modelo, tokenizador, configuración de transformer ni ningún artefacto propio de un modelo de lenguaje. La etiqueta `region:us` es la única metadato de Hugging Face presente, y no se declara licencia, idioma ni pipeline.

Dado que la ficha solicitada corresponde a un modelo de IA y este repositorio no lo es, los apartados técnicos se completan indicando "no disponible" en los campos que no aplican, y se documenta lo que sí contiene el artefacto: un harness de validación de arranque con verificación de checksum BLAKE3 y mapeo de BARs PCIe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un harness de simulación de arranque en C) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código fuente C, cabeceras `.h` y un `Makefile`) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. El artefacto es un conjunto de código C organizado en `include/` (cabeceras `radiate_sector_header.h`, `bios_sim.h`, `checksum.h`), `src/` (implementación del motor de arranque, wrapper BLAKE3, generador de blobs mock y la implementación de referencia vendorizada de BLAKE3) y `tests/` (suite `test_boot.c`), con un `Makefile` como sistema de construcción.

La lógica implementada en `bios_sim_boot` ingiere un blob binario NVMe simulado y ejecuta cuatro pasos: parseo de firmas de cabecera de sector (magic de 64 bits, versión, tipo de sector), evaluación del bitmask `CLEAN_SHUTDOWN` para decidir arranque normal o rollback a la última instantánea limpia, mapeo temprano de BARs PCIe (BAR0 para registros de control de GPU, BAR1 para VRAM GDDR6, BAR2 para snapshot/scratch) y activación de manejadores de fallo en modo usuario si la validación de checksum falla, con comportamiento fail-closed. La regla de checksum especifica que el digest BLAKE3 cubre la cabecera con el campo de checksum a cero más los bytes de payload, evitando la circularidad de un checksum que se cubre a sí mismo. No hay datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia que documentar.

## Capacidades

- Simulación de arranque: parsea cabeceras de sector con magic de 64 bits, versión y flags de tipo de sector.
- Evaluación de estado de apagado: interpreta el bitmask `CLEAN_SHUTDOWN` y decide entre arranque normal y rollback a la última instantánea limpia.
- Mapeo de BARs PCIe: asigna BAR0 (registros de control de GPU), BAR1 (VRAM GDDR6) y BAR2 (snapshot/scratch) en la fase temprana de arranque.
- Verificación de integridad: calcula y compara digests BLAKE3 reales sobre cabecera (con campo de checksum a cero) más payload.
- Manejo de fallos: activa manejadores de fallo en modo usuario y aplica fail-closed (detiene el arranque) ante checksum inválido.
- Generación de blobs de prueba: utilidad CLI `mock_blob` para producir blobs NVMe simulados.
- Suite de pruebas: 10 casos que cubren arranque limpio de host y LLM, rollback sucio, rollback sin instantánea, magic/versión/tipo/checksum inválidos, corrupción de payload previa al checksum, fichero ausente y verificación de tabla de BARs.
- No soporta tool calling, agentes, razonamiento, código generativo, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Validación de lógica de arranque en CI: el harness se ejecuta con `make test` y permite verificar en cada commit que las decisiones de arranque (cabecera, checksum, estado limpio/sucio) siguen siendo correctas sin necesidad de hardware.
- Desarrollo de contratos binarios: la cabecera `radiate_sector_header.h` sirve como borrador del contrato de sector para su revisión y aprobación antes de fijarlo, lo que permite iterar sobre el layout binario con pruebas automatizadas.
- Pruebas de rollback ante apagado sucio: el caso de test de "dirty rollback" permite comprobar que el motor revierte a la última instantánea limpia cuando el bitmask `CLEAN_SHUTDOWN` está a cero.
- Simulación de fallos de integridad: los casos de checksum inválido y corrupción de payload permiten validar el comportamiento fail-closed del manejador de fallos antes de trasladarlo al microkernel real.
- Verificación del mapa de BARs PCIe: la comprobación de tabla de BARs en las rutas de arranque permite validar la asignación BAR0/BAR1/BAR2 antes de integrarla con el hardware GDDR6.
- Auditoría de harness: el árbol `bios-sim/` se entrega completo por el canal de Hugging Face para que Sprint realice la auditoría del harness, según la dirección de Jim recogida en la model card.
- Generación de blobs reproducibles: la CLI `mock_blob` produce blobs NVMe simulados que permiten reproducir escenarios de arranque en entornos sin acceso a disco real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la suite consta de 10 casos de test, sin cifras de latencia, throughput ni cobertura.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica para ejecución; el código simula mapeo de BARs para VRAM GDDR6, pero no requiere GPU para ejecutarse.
- Cabe en consumer GPU: no aplica.
- Opciones de despliegue: compilación nativa con `make test`, que construye `mock_blob` y `test_boot` y ejecuta la suite. No se documentan contenedores, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de IA y no se han identificado en la información proporcionada proyectos comparables de harness de arranque publicados en Hugging Face.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de uso como modelo de IA es incorrecta.
- El contrato binario (`radiate_sector_header.h`) está marcado explícitamente como DRAFT y "nothing here is locked until Adam confirms it"; no debe tratarse como estable.
- La licencia no está declarada, por lo que no se puede asumir permiso de uso comercial, modificación ni redistribución.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10), lo que indica un artefacto recién publicado y sin validación externa.
- La model card contiene referencias a personas y flujos internos (Adam, Jim, Nova, Sprint) y a un canal de transferencia (Hugging Face) que no constituyen documentación técnica verificable.
- El harness valida lógica contra blobs simulados; no sustituye pruebas sobre hardware real ni garantiza el comportamiento del microkernel en producción.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque no aplican a este tipo de artefacto; sí aplica la ausencia de garantías de corrección formal del contrato binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Negsman/radiate-os-bios-sim
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
